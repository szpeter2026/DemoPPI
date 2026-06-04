/**
 * Trust FSS 0.1 — DemoPPI 侧客户端（调用 Nazha :5200 Verifier）
 *
 * 默认不接入投票 API；设 TRUST_FSS_ENABLED=true 时可作门禁。
 * 合同见 SurfaceZervi/docs/TRUST_FSS_PPI_0.1.md
 */

import {
  TRUST_FSS_ABC_FIXTURES,
  TRUST_FSS_SCHEMA_URL,
  type EvidenceRef,
  type FunctionalStatus,
  type VerifyProposalRequest,
  type VerifyProposalResponse,
} from "./types";

export {
  TRUST_FSS_SCHEMA_URL,
  TRUST_FSS_ABC_FIXTURES,
  type EvidenceRef,
  type FunctionalStatus,
  type VerifyProposalRequest,
  type VerifyProposalResponse,
};

const DEFAULT_VERIFIER_URL = "http://127.0.0.1:5200";

export function getTrustVerifierBaseUrl(): string {
  return (
    process.env.TRUST_VERIFIER_URL?.replace(/\/$/, "") ||
    DEFAULT_VERIFIER_URL
  );
}

export function isTrustFssEnabled(): boolean {
  return process.env.TRUST_FSS_ENABLED === "true";
}

export function canVoteWithStatus(status: FunctionalStatus): boolean {
  return status === "normal";
}

export type VerifyProposalOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
};

/**
 * 调用 Nazha Verifier：POST /trust/v1/verify-proposal
 */
export async function verifyProposalEvidence(
  body: VerifyProposalRequest,
  options?: VerifyProposalOptions
): Promise<VerifyProposalResponse> {
  const base = (options?.baseUrl ?? getTrustVerifierBaseUrl()).replace(
    /\/$/,
    ""
  );
  const res = await fetch(`${base}/trust/v1/verify-proposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `trust verifier HTTP ${res.status}: ${text || res.statusText}`
    );
  }

  return (await res.json()) as VerifyProposalResponse;
}

export type AbcCaseResult = {
  caseId: "A" | "B" | "C";
  label: string;
  expected: FunctionalStatus;
  actual: FunctionalStatus;
  ok: boolean;
  record_id?: string;
  detail?: string;
};

/**
 * 运行 A/B/C 三用例（需 Verifier 已启动且 TRUST_FSS_MOCK=true）
 */
export async function runTrustFssAbcSelfCheck(
  options?: VerifyProposalOptions
): Promise<{ passed: boolean; results: AbcCaseResult[] }> {
  const results: AbcCaseResult[] = [];

  for (const caseId of ["A", "B", "C"] as const) {
    const fx = TRUST_FSS_ABC_FIXTURES[caseId];
    const out = await verifyProposalEvidence(fx.payload, options);
    results.push({
      caseId,
      label: fx.label,
      expected: fx.expect,
      actual: out.functional_status,
      ok: out.functional_status === fx.expect,
      record_id: out.record_id,
      detail: out.detail,
    });
  }

  return {
    passed: results.every((r) => r.ok),
    results,
  };
}

/**
 * 投票前可选门禁：未启用 TRUST_FSS 时直接返回 allowed=true
 */
export async function assertProposalEvidenceForVote(
  body: VerifyProposalRequest
): Promise<
  | { allowed: true; verification: VerifyProposalResponse }
  | { allowed: false; verification: VerifyProposalResponse }
> {
  if (!isTrustFssEnabled()) {
    return {
      allowed: true,
      verification: {
        schema_url: TRUST_FSS_SCHEMA_URL,
        record_id: "skipped-trust-fss-disabled",
        subject: body.subject,
        functional_status: "normal",
        detail: "TRUST_FSS_ENABLED is not true — verifier skipped",
        verifier: { id: "demoppi-stub", rule_version: "disabled" },
        data_set: {
          digest: "sha256:disabled",
          evidence_refs: body.evidence_refs,
        },
        occurred_at: new Date().toISOString(),
      },
    };
  }

  const verification = await verifyProposalEvidence(body);
  const allowed = canVoteWithStatus(verification.functional_status);
  return allowed
    ? { allowed: true, verification }
    : { allowed: false, verification };
}

/** Supabase service-role client（仅 append 审计用） */
export type TrustFssSupabaseClient = {
  from: (table: string) => {
    insert: (
      row: Record<string, unknown>
    ) => Promise<{ error: { message: string } | null }>;
  };
};

/**
 * 可选：将 FSS 结果写入 Supabase 只增表（需先执行 optional migration）
 */
export async function appendTrustFssRecord(
  verification: VerifyProposalResponse,
  supabase: TrustFssSupabaseClient
): Promise<void> {
  const { error } = await supabase.from("trust_fss_records").insert({
    record_id: verification.record_id,
    subject_kind: verification.subject.kind,
    subject_id: verification.subject.id,
    functional_status: verification.functional_status,
    data_set_digest: verification.data_set.digest,
    evidence_refs: verification.data_set.evidence_refs,
    verifier_id: verification.verifier.id,
    rule_version: verification.verifier.rule_version,
    detail: verification.detail,
    raw_response: verification,
  });

  if (error) {
    throw new Error(`trust_fss_records insert: ${error.message}`);
  }
}
