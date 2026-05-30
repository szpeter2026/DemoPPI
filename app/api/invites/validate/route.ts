import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/invites/validate?code=XXXX
 * 校验邀请码是否有效（公开接口，不需要登录）
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ valid: false, error: "Missing code" }, { status: 400 });
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
