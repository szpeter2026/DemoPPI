-- ============================================================
-- 第八部分：Trust FSS 0.1 — 可选审计表
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

create index if not exists idx_trust_fss_records_subject
  on public.trust_fss_records (subject_kind, subject_id, created_at desc);

alter table public.trust_fss_records enable row level security;

create policy if not exists "trust_fss_records_select_authenticated"
  on public.trust_fss_records
  for select
  to authenticated
  using (true);
