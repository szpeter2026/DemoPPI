import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/quota/check
 * 检查并扣减配额（原子操作）
 *
 * Body: { resource_type: "discover" | "view_profile" | "follow" }
 * Response: { allowed, tier, limit, used, remaining }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { resource_type } = body;

  if (!resource_type || !["discover", "view_profile", "follow"].includes(resource_type)) {
    return NextResponse.json(
      { error: "invalid resource_type, must be discover|view_profile|follow" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.rpc("check_and_consume_quota", {
    p_user_id: user.id,
    p_resource_type: resource_type,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
