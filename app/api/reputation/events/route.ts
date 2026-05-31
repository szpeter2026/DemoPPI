import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/reputation/events
 * 记录声誉事件，更新用户声誉分和勋章
 *
 * 请求体：
 *   action_type: 行为类型（如 complete_profile, receive_follow, consensus_match 等）
 *   reference_id?: 关联对象ID
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action_type, reference_id } = body;

    if (!action_type) {
      return NextResponse.json(
        { error: "action_type is required" },
        { status: 400 }
      );
    }

    const validActionTypes = [
      "complete_profile",
      "receive_follow",
      "consensus_match",
      "invite_register",
      "create_content",
      "host_activity",
      "participate_gov",
      "absent",
      "report_confirmed",
    ];

    if (!validActionTypes.includes(action_type)) {
      return NextResponse.json(
        { error: `invalid action_type, must be one of: ${validActionTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // 调用 RPC 记录事件（自动更新声誉分+升级勋章）
    const { data, error } = await supabase.rpc("record_reputation_event", {
      p_user_id: user.id,
      p_action_type: action_type,
      p_reference_id: reference_id || null,
    });

    if (error) {
      console.error("[reputation/events] RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[reputation/events] error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reputation/events?action_type=xxx&limit=20&offset=0
 * 查询当前用户的声誉事件记录
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get("action_type");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabase
      .from("reputation_events")
      .select("id, action_type, points, reference_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (actionType) {
      query = query.eq("action_type", actionType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data, limit, offset });
  } catch (err) {
    console.error("[reputation/events] GET error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
