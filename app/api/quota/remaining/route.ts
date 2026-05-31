import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/quota/remaining?resource_type=discover
 * 查询剩余配额（不扣减）
 *
 * Response: { tier, limit, used, remaining }
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resource_type = searchParams.get("resource_type") ?? "discover";

  if (!["discover", "view_profile", "follow"].includes(resource_type)) {
    return NextResponse.json(
      { error: "invalid resource_type, must be discover|view_profile|follow" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("get_quota_remaining", {
    p_user_id: user.id,
    p_resource_type: resource_type,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
