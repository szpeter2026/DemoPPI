import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/invites/list
 * 列出当前用户的邀请码及其状态（需要登录）
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: invites, error } = await supabase
    .from("invites")
    .select("code, used_by, used_at, expires_at, created_at")
    .eq("issuer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get quota
  const { data: profile } = await supabase
    .from("profiles")
    .select("invite_quota")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    invites: invites ?? [],
    quota: profile?.invite_quota ?? 0,
  });
}
