import { NextRequest, NextResponse } from "next/server";
import {
  runTrustFssAbcSelfCheck,
  verifyProposalEvidence,
} from "@/lib/trust/verify-proposal";
import type { VerifyProposalRequest } from "@/lib/trust/types";

/**
 * POST /api/trust/verify-proposal
 * 代理到 Nazha Verifier（:5200），不写入 Supabase。
 *
 * Query: ?selfcheck=1  → 运行 A/B/C 三用例（需 TRUST_FSS_MOCK=true）
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("selfcheck") === "1") {
      const report = await runTrustFssAbcSelfCheck();
      return NextResponse.json(report, {
        status: report.passed ? 200 : 502,
      });
    }

    const body = (await request.json()) as VerifyProposalRequest;
    if (!body?.subject?.kind || !body?.subject?.id) {
      return NextResponse.json(
        { error: "subject.kind and subject.id are required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.evidence_refs)) {
      return NextResponse.json(
        { error: "evidence_refs must be an array" },
        { status: 400 }
      );
    }

    const result = await verifyProposalEvidence(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "verifier error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
