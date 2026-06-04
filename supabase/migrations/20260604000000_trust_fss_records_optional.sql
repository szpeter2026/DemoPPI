-- ============================================================
-- Trust FSS 0.1 — 可选审计表（与 DemoPPI 治理并行，不修改 proposals 结构）
-- 执行前阅读：SurfaceZervi/docs/TRUST_FSS_PPI_0.1.md
-- ============================================================

create table if not exists public.trust_fss_records (
  id bigserial primary key,
  record_id uuid not null unique,
  subject_kind text not null,
  subject_id text not null,
  functional_status text not null check (
    functional_status in ('normal', 'no_data', 'no_computed', 'functional_test')
  ),
  data_set_digest text not null,
  evidence_refs jsonb not null default '[]',
  verifier_id text not null,
  rule_version text not null,
  detail text,
  raw_response jsonb not null default '{}',
  created_at timestamptz not null default now()
);

comment on table public.trust_fss_records is
  'Trust FSS 0.1 只增审计；由 DemoPPI appendTrustFssRecord 或后续管道写入';

create index if not exists idx_trust_fss_records_subject
  on public.trust_fss_records (subject_kind, subject_id, created_at desc);

alter table public.trust_fss_records enable row level security;

-- 认证用户可读；写入建议走 service role（应用层）
create policy if not exists "trust_fss_records_select_authenticated"
  on public.trust_fss_records
  for select
  to authenticated
  using (true);
