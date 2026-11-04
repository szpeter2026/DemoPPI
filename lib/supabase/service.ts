import { createClient } from "@supabase/supabase-js";

/**
 * Service role client — trust_fss_records 等仅服务端写入。
 * 未配置 SUPABASE_SERVICE_ROLE_KEY 时返回 null（不阻塞投票主路径）。
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
