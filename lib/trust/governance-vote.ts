import type { SupabaseClient } from "@supabase/supabase-js";
import type { EvidenceRef, VerifyProposalRequest } from "./types";

export type GovernanceProposalRow = {
  id: number;
  title: string;
  description: string;
  execution_data: Record<string, unknown> | null;
};

export function parseEvidenceRefs(value: unknown): EvidenceRef[] | null {
  if (!Array.isArray(value)) return null;

  const refs: EvidenceRef[] = [];
  for (const item of value) {
    if (
      item &&
      typeof item === "object" &&
      (item as EvidenceRef).kind === "nazha.chunk" &&
      typeof (item as EvidenceRef).id === "string" &&
      (item as EvidenceRef).id.trim()
    ) {
      refs.push({
        kind: "nazha.chunk",
        id: (item as EvidenceRef).id.trim(),
      });
    }
  }

  return refs.length > 0 ? refs : null;
}

/** 请求体 evidence_refs 优先，否则读 proposal.execution_data.evidence_refs */
export function resolveEvidenceRefs(
  bodyRefs: unknown,
  executionData: unknown
): EvidenceRef[] | null {
  const fromBody = parseEvidenceRefs(bodyRefs);
  if (fromBody) return fromBody;

  if (executionData && typeof executionData === "object") {
    const raw = (executionData as { evidence_refs?: unknown }).evidence_refs;
    return parseEvidenceRefs(raw);
  }

  return null;
}

export async function fetchGovernanceProposal(
  supabase: SupabaseClient,
  proposalId: string | number
): Promise<GovernanceProposalRow | null> {
  const { data, error } = await supabase
    .from("governance_proposals")
    .select("id, title, description, execution_data")
    .eq("id", proposalId)
    .single();

  if (error || !data) return null;
  return data as GovernanceProposalRow;
}

export function buildVerifyRequestForVote(
  proposal: GovernanceProposalRow,
  options: {
    evidence_refs: EvidenceRef[];
    proposal_text?: string;
    min_similarity?: number;
  }
): VerifyProposalRequest {
  const text =
    options.proposal_text?.trim() ||
    `${proposal.title}\n${proposal.description}`.trim();

  return {
    subject: {
      kind: "governance.proposal",
      id: String(proposal.id),
    },
    proposal_text: text || undefined,
    evidence_refs: options.evidence_refs,
    min_similarity: options.min_similarity,
  };
}
