import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/invites/generate
 * 生成邀请码（需要登录）
 * Body: { count?: number } (default 1, max 5)
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { count?: number } = {};
  try {
    body = await request.json();
  } catch {}

  const count = Math.min(Math.max(1, body.count ?? 1), 5);
  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    const { data, error } = await supabase.rpc("generate_invite", { p_issuer_id: user.id });
    if (error) {
      // Quota exceeded
      return NextResponse.json(
        { error: error.message || "Invite quota exceeded", codes },
        { status: 422 }
      );
    }
    codes.push(data);
  }

  return NextResponse.json({ codes });
}
