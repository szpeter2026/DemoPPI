import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/governance/votes
 * 治理投票（仅付费用户，权重=治理权重）
 *
 * 请求体：
 *   proposal_id: 提案ID
 *   vote: 投票选项（for/against/abstain）
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
    const { proposal_id, vote } = body;

    if (!proposal_id || !vote) {
      return NextResponse.json(
        { error: "proposal_id and vote are required" },
        { status: 400 }
      );
    }

    const validVotes = ["for", "against", "abstain"];
    if (!validVotes.includes(vote)) {
      return NextResponse.json(
        { error: `invalid vote, must be one of: ${validVotes.join(", ")}` },
        { status: 400 }
      );
    }

    // 通过 RPC 投票（内部检查档位、提案状态、计算权重）
    const { data, error } = await supabase.rpc("cast_governance_vote", {
      p_proposal_id: proposal_id,
      p_voter_id: user.id,
      p_vote: vote,
    });

    if (error) {
      console.error("[governance/votes] RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果 RPC 返回 success: false，返回对应的 HTTP 状态码
    if (data && !data.success) {
      const statusCode =
        data.error === "governance_requires_paid_tier"
          ? 403
          : data.error === "proposal_not_found"
            ? 404
            : data.error === "voting_ended"
              ? 410
              : 400;
      return NextResponse.json(data, { status: statusCode });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[governance/votes] error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/governance/votes?proposal_id=xxx
 * 查询某提案的投票记录
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get("proposal_id");

    if (!proposalId) {
      return NextResponse.json(
        { error: "proposal_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("governance_votes")
      .select("id, voter_id, vote, weight, created_at")
      .eq("proposal_id", proposalId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ votes: data });
  } catch (err) {
    console.error("[governance/votes] GET error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
