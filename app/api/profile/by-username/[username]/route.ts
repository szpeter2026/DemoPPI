import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * GET /api/profile/by-username/[username]
 * 根据 username 或 id (UUID) 获取用户 profile（公开信息）
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const param = decodeURIComponent((await params).username);
  const supabase = await createClient();

  const isUuid = UUID_REGEX.test(param);
  const query = isUuid
    ? supabase.from("profiles").select("id, username, layer0, layer1, visibility_settings").eq("id", param)
    : supabase.from("profiles").select("id, username, layer0, layer1, visibility_settings").eq("username", param);

  const { data, error } = await query.single();

  if (error || !data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const visibility = (data.visibility_settings as Record<string, unknown>) ?? {};
  const showInDiscover = visibility.show_in_discover !== false;

  return NextResponse.json({
    ...data,
    show_in_discover: showInDiscover,
  });
}
