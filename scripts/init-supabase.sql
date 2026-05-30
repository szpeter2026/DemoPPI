-- Supabase 初始化 Schema（从 kung-fu/migrations 摘取）
-- 摘取日期：2026-05-31
-- 执行方式：在 Supabase Dashboard → SQL Editor 中执行

-- 启用必要扩展
create extension if not exists "uuid-ossp";

-- ==================== 用户档案表 ====================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  
  -- Layer 0 数据（JSONB 格式）
  layer0 jsonb default '{}'::jsonb,
  
  -- 共识度缓存（可选，用于加速查询）
  consensus_score numeric(5,2) default 0,
  
  -- 元数据
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3)
);

-- ==================== 邀请码表 ====================
create table if not exists public.invites (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  issuer_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 配额管理
  quota integer default 5 not null,
  used_count integer default 0 not null,
  
  -- 使用记录
  used_by uuid[] default array[]::uuid[],
  
  -- 时效
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint positive_quota check (quota > 0),
  constraint valid_used_count check (used_count >= 0 and used_count <= quota)
);

-- ==================== 连接（关注）表 ====================
create table if not exists public.connections (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  
  -- 共识度快照（关注时的共识度）
  consensus_at_follow numeric(5,2),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- 唯一约束：不能重复关注
  unique(follower_id, following_id),
  constraint not_self_follow check (follower_id != following_id)
);

-- ==================== 标签表 ====================
create table if not exists public.tags (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  category text, -- 'value' | 'interest' | 'skill'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==================== 用户标签关联表 ====================
create table if not exists public.user_tags (
  user_id uuid references public.profiles(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  
  -- 权重（0-1，可选）
  weight numeric(3,2) default 1.0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (user_id, tag_id)
);

-- ==================== RLS (Row Level Security) 策略 ====================

-- 启用 RLS
alter table public.profiles enable row level security;
alter table public.invites enable row level security;
alter table public.connections enable row level security;
alter table public.tags enable row level security;
alter table public.user_tags enable row level security;

-- Profiles: 所有人可读，仅本人可写
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Invites: 仅邀请人可读写自己的邀请码
create policy "Users can manage own invites" on public.invites for all using (auth.uid() = issuer_id);

-- Connections: 所有人可读，仅本人可创建/删除自己的关注
create policy "Connections are public" on public.connections for select using (true);
create policy "Users can follow/unfollow" on public.connections for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.connections for delete using (auth.uid() = follower_id);

-- Tags: 所有人可读
create policy "Tags are public" on public.tags for select using (true);

-- User Tags: 所有人可读用户标签，仅本人可管理自己的标签
create policy "User tags are public" on public.user_tags for select using (true);
create policy "Users can manage own tags" on public.user_tags for all using (auth.uid() = user_id);

-- ==================== 索引 ====================

create index if not exists profiles_username_idx on public.profiles(username);
create index if not exists profiles_consensus_idx on public.profiles(consensus_score desc);
create index if not exists connections_follower_idx on public.connections(follower_id);
create index if not exists connections_following_idx on public.connections(following_id);
create index if not exists user_tags_user_idx on public.user_tags(user_id);
create index if not exists user_tags_tag_idx on public.user_tags(tag_id);

-- ==================== 存储桶（头像）====================

-- 在 Supabase Dashboard → Storage 中手动创建：
-- 1. 创建 bucket: `avatars`
-- 2. 设置为 Public bucket
-- 3. 配置 RLS Policy:
--    - SELECT: public
--    - INSERT: authenticated, user_id = auth.uid()
--    - UPDATE: authenticated, user_id = auth.uid()
--    - DELETE: authenticated, user_id = auth.uid()

-- ==================== 初始化数据 ====================

-- 插入默认标签（示例）
insert into public.tags (name, category) values
  ('诚信', 'value'),
  ('创新', 'value'),
  ('协作', 'value'),
  ('责任', 'value'),
  ('AI', 'interest'),
  ('创业', 'interest'),
  ('设计', 'interest'),
  ('开源', 'interest')
on conflict (name) do nothing;

-- ==================== 完成 ====================
-- 执行后，在 Supabase Dashboard 中确认：
-- 1. Tables 已创建
-- 2. RLS 已启用
-- 3. Policies 已创建
-- 4. Indexes 已创建
-- 5. Storage bucket `avatars` 已创建并配置 RLS
