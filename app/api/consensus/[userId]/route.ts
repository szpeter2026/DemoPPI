import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateConsensusScore } from "@/lib/consensus/calculate";

/**
 * GET /api/consensus/[userId]
 * 计算当前用户与指定用户的共识度
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: targetUserId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.id === targetUserId) {
    return NextResponse.json({
      score: 100,
      valueScore: 40,
      interestScore: 30,
      valueOverlap: [],
      interestOverlap: [],
    });
  }

  const [meRes, targetRes] = await Promise.all([
    supabase.from("profiles").select("layer0").eq("id", user.id).single(),
    supabase.from("profiles").select("layer0").eq("id", targetUserId).single(),
  ]);

  if (meRes.error || !meRes.data || targetRes.error || !targetRes.data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const myLayer0 = (meRes.data.layer0 as Record<string, unknown>) ?? {};
  const targetLayer0 = (targetRes.data.layer0 as Record<string, unknown>) ?? {};

  const result = calculateConsensusScore(
    {
      value_tags: (myLayer0.value_tags as string[]) ?? [],
      interest_tags: (myLayer0.interest_tags as string[]) ?? [],
    },
    {
      value_tags: (targetLayer0.value_tags as string[]) ?? [],
      interest_tags: (targetLayer0.interest_tags as string[]) ?? [],
    }
  );

  return NextResponse.json(result);
}
