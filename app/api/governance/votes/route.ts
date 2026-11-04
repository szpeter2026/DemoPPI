import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  buildVerifyRequestForVote,
  fetchGovernanceProposal,
  resolveEvidenceRefs,
} from "@/lib/trust/governance-vote";
import type { EvidenceRef } from "@/lib/trust/types";
import {
  appendTrustFssRecord,
  assertProposalEvidenceForVote,
  isTrustFssEnabled,
} from "@/lib/trust/verify-proposal";

/**
 * POST /api/governance/votes
 * 治理投票（仅付费用户，权重=治理权重）
 *
 * Trust FSS 0.1（可选）：TRUST_FSS_ENABLED=true 时投票前调用 Nazha :5200；
 * 合同见 SurfaceZervi/docs/TRUST_FSS_PPI_0.1.md
 *
 * 请求体：
 *   proposal_id: 提案ID
 *   vote: for | against | abstain
 *   evidence_refs?: [{ kind: "nazha.chunk", id: "..." }] — 门禁开启时必填（或与提案 execution_data 内一致）
 *   proposal_text?: 覆盖验真用摘要（默认 title + description）
 *   min_similarity?: 覆盖 Verifier 阈值
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      proposal_id,
      vote,
      evidence_refs: bodyEvidenceRefs,
      proposal_text,
      min_similarity,
    } = body;

    if (!proposal_id || !vote) {
      return NextResponse.json(
        { error: "proposal_id and vote are required" },
        { status: 400 }
      );
    }

    const validVotes = ["for", "against", "abstain"];
    if (!validVotes.includes(vote)) {
      return NextResponse.json(
        { error: `invalid vote, must be one of: ${validVotes.join(", ")}` },
        { status: 400 }
      );
    }

    if (isTrustFssEnabled()) {
      const proposal = await fetchGovernanceProposal(supabase, proposal_id);
      if (!proposal) {
        return NextResponse.json(
          { error: "proposal_not_found" },
          { status: 404 }
        );
      }

      const evidenceRefs: EvidenceRef[] | null = resolveEvidenceRefs(
        bodyEvidenceRefs,
        proposal.execution_data
      );

      if (!evidenceRefs) {
        return NextResponse.json(
          {
            error: "trust_fss_evidence_required",
            message:
              "TRUST_FSS_ENABLED=true 时需要 evidence_refs（请求体或提案 execution_data.evidence_refs）",
          },
          { status: 400 }
        );
      }

      const verifyBody = buildVerifyRequestForVote(proposal, {
        evidence_refs: evidenceRefs,
        proposal_text:
          typeof proposal_text === "string" ? proposal_text : undefined,
        min_similarity:
          typeof min_similarity === "number" ? min_similarity : undefined,
      });

      let gate;
      try {
        gate = await assertProposalEvidenceForVote(verifyBody);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "trust verifier unavailable";
        return NextResponse.json(
          { error: "trust_verifier_error", message },
          { status: 502 }
        );
      }

      const serviceClient = createServiceRoleClient();
      if (serviceClient) {
        try {
          await appendTrustFssRecord(gate.verification, serviceClient as any);
        } catch (auditErr) {
          console.warn(
            "[governance/votes] trust_fss_records append failed:",
            auditErr
          );
        }
      }

      if (!gate.allowed) {
        return NextResponse.json(
          {
            error: "trust_fss_evidence_rejected",
            functional_status: gate.verification.functional_status,
            detail: gate.verification.detail,
            record_id: gate.verification.record_id,
          },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase.rpc("cast_governance_vote", {
      p_proposal_id: proposal_id,
      p_voter_id: user.id,
      p_vote: vote,
    });

    if (error) {
      console.error("[governance/votes] RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && !data.success) {
      const statusCode =
        data.error === "governance_requires_paid_tier"
          ? 403
          : data.error === "proposal_not_found"
            ? 404
            : data.error === "voting_ended"
              ? 410
              : 400;
      return NextResponse.json(data, { status: statusCode });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[governance/votes] error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/governance/votes?proposal_id=xxx
 * 查询某提案的投票记录
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposal_id");

    if (!proposalId) {
      return NextResponse.json(
        { error: "proposal_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("governance_votes")
      .select("id, voter_id, vote, weight, created_at")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ votes: data });
  } catch (err) {
    console.error("[governance/votes] GET error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
