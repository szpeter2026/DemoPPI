import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/connections/status?userId=xxx
 * 检查当前用户是否关注了指定用户，以及是否被关注
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ following: false, followedBy: false });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");

  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  if (user.id === targetUserId) {
    return NextResponse.json({ following: false, followedBy: false });
  }

  const [amFollowing, followsMe] = await Promise.all([
    supabase
      .from("connections")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("id")
      .eq("follower_id", targetUserId)
      .eq("following_id", user.id)
      .maybeSingle(),
  ]);

  return NextResponse.json({
    following: !!amFollowing?.data,
    followedBy: !!followsMe?.data,
  });
}
