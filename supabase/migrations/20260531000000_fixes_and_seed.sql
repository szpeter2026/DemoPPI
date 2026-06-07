-- ============================================
-- 2026-05-31 修复 & 种子数据
-- 背景：初次部署时发现的问题修复
-- ============================================

-- [说明] 以下内容均已在 Supabase 控制台手动执行完毕，
-- 此文件作为操作记录保存，勿重复执行（会报冲突）。
-- 若需全新部署，按顺序执行 0000 → 0001 → 0530 → 本文件 → 0531_quota_system。

-- ============================================
-- 1. Supabase Auth 控制台配置（手动操作，无 SQL）
-- ============================================
-- 路径：Settings > Auth > Providers > Email
-- - Enable Email provider: ON
-- - Confirm email: OFF（开发阶段，避免邮件 rate limit）
-- - Allow new users to sign up: ON

-- ============================================
-- 2. 种子邀请码（首个管理员用）
-- 仅在 auth.users 中已有用户时才插入
-- ============================================
do $$
declare
  first_user_id uuid;
begin
  select id into first_user_id from auth.users order by created_at asc limit 1;
  if found then
    insert into public.invites (code, issuer_id, expires_at)
    values ('DEMO0001', first_user_id, now() + interval '30 days')
    on conflict (code) do nothing;
  end if;
end $$;

-- ============================================
-- 3. 替代方案：环境变量种子码
-- ============================================
-- 如果不想依赖数据库种子码，可使用 SEED_INVITE_CODE 环境变量
-- 在 .env 中设置 SEED_INVITE_CODE=YOUR_SECRET_CODE
-- 这样无需在数据库中插入邀请码即可注册首个用户

-- ============================================
-- 4. Supabase 速率限制说明
-- ============================================
-- 免费版邮件发送限制：3封/小时
-- 解决方案：关闭 Confirm email（见第1步）
-- 生产上线前需配置自定义 SMTP（Settings > Auth > SMTP）

-- ============================================
-- 5. 后续待办（Phase 2）
-- ============================================
-- [ ] 配置自定义 SMTP（避免 rate limit）
-- [ ] Storage bucket "avatars" 创建（Dashboard 手动或 SQL）
-- [ ] 生产环境重新开启 Confirm email
-- [ ] 为正式管理员账号生成初始邀请码池
-- [ ] 接入 Tatha 支付流水后，更新 user_tiers 档位
