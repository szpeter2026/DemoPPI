-- ============================================
-- INVITES TABLE (MVP: invite-only registration)
-- 邀请码表：控制注册准入
-- ============================================

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  issuer_id uuid not null references auth.users(id) on delete cascade,
  used_by uuid references auth.users(id) on delete set null,
  used_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz default now() not null
);

create index idx_invites_code on public.invites(code);
create index idx_invites_issuer on public.invites(issuer_id);

alter table public.invites enable row level security;

-- issuer 可读自己的邀请码
create policy "Users can view own invites"
  on public.invites for select
  using (auth.uid() = issuer_id);

-- authenticated user 可插入邀请码（issuer_id 强制为当前用户）
create policy "Users can create own invites"
  on public.invites for insert
  with check (auth.uid() = issuer_id);

-- ============================================
-- INVITE QUOTA: 每用户初始额度（存储在 profiles 的 metadata 中）
-- 新用户注册后自动获得 5 个邀请额度
-- ============================================

-- 为 profiles 表添加 invite_quota 字段
alter table public.profiles
  add column if not exists invite_quota int not null default 5;

-- ============================================
-- RPC: validate_invite(code) — 校验邀请码是否有效
-- security definer 确保可以读取 invites 表
-- ============================================
create or replace function public.validate_invite(p_code text)
returns table (
  valid boolean,
  issuer_id uuid,
  expires_at timestamptz
)
language plpgsql security definer as $$
begin
  return query
  select
    (i.used_by is null and i.expires_at > now()) as valid,
    i.issuer_id,
    i.expires_at
  from public.invites i
  where i.code = p_code;
end;
$$;

-- ============================================
-- RPC: consume_invite(code, user_id) — 消耗邀请码
-- security definer，在注册成功后调用
-- ============================================
create or replace function public.consume_invite(p_code text, p_user_id uuid)
returns boolean
language plpgsql security definer as $$
declare
  v_invite invites%rowtype;
begin
  select * into v_invite from public.invites where code = p_code for update;

  if v_invite.id is null then
    return false;
  end if;

  if v_invite.used_by is not null then
    return false; -- already used
  end if;

  if v_invite.expires_at <= now() then
    return false; -- expired
  end if;

  update public.invites
  set used_by = p_user_id, used_at = now()
  where id = v_invite.id;

  return true;
end;
$$;

-- ============================================
-- RPC: generate_invite() — 生成邀请码
-- 返回新创建的邀请码
-- ============================================
create or replace function public.generate_invite(p_issuer_id uuid)
returns text
language plpgsql security definer as $$
declare
  v_new_code text;
  v_quota int;
begin
  -- 检查用户剩余额度
  select invite_quota into v_quota from public.profiles where id = p_issuer_id;
  if v_quota <= 0 then
    raise exception 'No invite quota remaining';
  end if;

  -- 生成 8 位随机码（循环确保唯一）
  loop
    v_new_code := upper(encode(gen_random_bytes(4), 'hex'));
    exit when not exists (select 1 from public.invites where code = v_new_code);
  end loop;

  -- 插入邀请码
  insert into public.invites (code, issuer_id)
  values (v_new_code, p_issuer_id);

  -- 扣减额度
  update public.profiles
  set invite_quota = invite_quota - 1
  where id = p_issuer_id;

  return v_new_code;
end;
$$;
