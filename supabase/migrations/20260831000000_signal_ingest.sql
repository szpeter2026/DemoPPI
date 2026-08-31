-- signal_ingest: GFCC+THOMAS 双线闭环的信号收件箱
-- 表已在云端手动创建（looma 侧 signal bridge 使用），
-- 此迁移用于版本化对齐：2026-08-31 由 `supabase db dump --linked` 生成。
-- 复合主键 (signal_type, user_email_hash, nonce) 天然承担幂等去重。

create table if not exists public.signal_ingest (
    signal_type text not null,
    user_email_hash text not null,
    nonce text not null,
    payload_json jsonb,
    created_at timestamptz not null default now(),
    constraint signal_ingest_pkey primary key (signal_type, user_email_hash, nonce)
);

alter table public.signal_ingest enable row level security;

-- 无任何 policy：anon / authenticated 默认拒绝，仅 service_role 可读写
grant all on table public.signal_ingest to anon;
grant all on table public.signal_ingest to authenticated;
grant all on table public.signal_ingest to service_role;
