import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/invites/validate?code=XXXX
 * 校验邀请码是否有效（公开接口，不需要登录）
 *
 * 特殊逻辑：
 * - 如果环境变量 SEED_INVITE_CODE 已设置，且请求码与之匹配，
 *   直接返回 valid: true（用于首个用户注册，无需数据库记录）
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, error: "Missing code" }, { status: 400 });
  }

  // ★ 种子码白名单（仅在设置了环境变量时生效）
  const seedCode = process.env.SEED_INVITE_CODE?.trim().toUpperCase();
  if (seedCode && code === seedCode) {
    return NextResponse.json({
      valid: true,
      expires_at: new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
      is_seed: true, // ★ 告知前端这是种子码，无需消费
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_invite", { p_code: code });

  if (error) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: data[0].valid,
    expires_at: data[0].expires_at,
  });
}
