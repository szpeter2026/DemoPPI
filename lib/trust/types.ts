/** Trust FSS PPI 0.1 — 与 docs/TRUST_FSS_PPI_0.1.md 对齐 */

export const TRUST_FSS_SCHEMA_URL =
  "https://surfacezervi.local/trust/fss/0.1" as const;

export type FunctionalStatus =
  | "normal"
  | "no_data"
  | "no_computed"
  | "functional_test";

export type EvidenceRef = {
  kind: "nazha.chunk";
  id: string;
};

export type VerifyProposalRequest = {
  subject: { kind: "governance.proposal"; id: string };
  proposal_text?: string;
  evidence_refs: EvidenceRef[];
  min_similarity?: number;
};

export type VerifyProposalResponse = {
  schema_url: string;
  record_id: string;
  subject: VerifyProposalRequest["subject"];
  functional_status: FunctionalStatus;
  detail: string;
  verifier: { id: string; rule_version: string };
  data_set: {
    digest: string;
    proposal_text?: string;
    evidence_refs: EvidenceRef[];
    checks?: Array<{
      ref: string;
      found: boolean;
      similarity?: number;
      min_similarity?: number;
      error?: string;
    }>;
  };
  occurred_at: string;
};

/** A/B/C 演示用例（需 Nazha TRUST_FSS_MOCK=true） */
export const TRUST_FSS_ABC_FIXTURES = {
  A: {
    label: "normal",
    payload: {
      subject: { kind: "governance.proposal" as const, id: "demo-a" },
      proposal_text: "根据社区宪章调整邀请额度与治理委员会规则",
      evidence_refs: [{ kind: "nazha.chunk" as const, id: "chunk_mock_ok" }],
    },
    expect: "normal" as FunctionalStatus,
  },
  B: {
    label: "no_data",
    payload: {
      subject: { kind: "governance.proposal" as const, id: "demo-b" },
      evidence_refs: [
        { kind: "nazha.chunk" as const, id: "chunk_does_not_exist" },
      ],
    },
    expect: "no_data" as FunctionalStatus,
  },
  C: {
    label: "no_computed",
    payload: {
      subject: { kind: "governance.proposal" as const, id: "demo-c" },
      proposal_text: "量子芯片出口管制与稀土供应链",
      evidence_refs: [{ kind: "nazha.chunk" as const, id: "chunk_mock_low" }],
      min_similarity: 0.5,
    },
    expect: "no_computed" as FunctionalStatus,
  },
} as const;
