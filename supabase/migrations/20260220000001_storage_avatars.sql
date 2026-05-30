-- Storage: avatars bucket
-- 在 Supabase Dashboard > Storage 中先创建 bucket "avatars" (public)
-- 然后执行下方 policy（若已通过 Dashboard 创建 bucket）

-- 若通过 SQL 创建 bucket（取消注释执行）:
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict (id) do nothing;

-- RLS: 任何人可读取头像
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- RLS: 用户只能上传到自己的目录 avatars/{user_id}/
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS: 用户只能更新自己的头像
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
