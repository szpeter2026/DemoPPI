import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateConsensusScore } from "@/lib/consensus/calculate";

/**
 * GET /api/discover
 * 发现页：获取所有 show_in_discover 的用户，支持搜索和筛选
 * 已登录时返回带共识度的用户
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("search") ?? "").trim();
  const valueTag = searchParams.get("value_tag") ?? "";
  const interestTag = searchParams.get("interest_tag") ?? "";
  const minConsensus = Math.max(0, Math.min(100, parseInt(searchParams.get("min_consensus") ?? "0", 10)));
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)), 100);

  let searchTagIds: string[] = [];
  if (search) {
    const [vt, it] = await Promise.all([
      supabase.from("value_tags").select("id, label"),
      supabase.from("interest_tags").select("id, label"),
    ]);
    const s = search.toLowerCase();
    searchTagIds = [
      ...(vt.data ?? []).filter((t) => t.label.toLowerCase().includes(s)).map((t) => t.id),
      ...(it.data ?? []).filter((t) => t.label.toLowerCase().includes(s)).map((t) => t.id),
    ];
  }

  let query = supabase
    .from("profiles")
    .select("id, username, layer0, visibility_settings")
    .not("layer0", "eq", "{}");

  const { data: profiles, error } = await query.limit(limit * 3);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let myLayer0 = { value_tags: [] as string[], interest_tags: [] as string[] };
  if (user) {
    const { data: me } = await supabase
      .from("profiles")
      .select("layer0")
      .eq("id", user.id)
      .single();
    const layer0 = (me?.layer0 as Record<string, unknown>) ?? {};
    myLayer0 = {
      value_tags: (layer0.value_tags as string[]) ?? [],
      interest_tags: (layer0.interest_tags as string[]) ?? [],
    };
  }

  let results = (profiles ?? [])
    .filter((p) => p.id !== user?.id)
    .filter((p) => {
      const vs = (p.visibility_settings as Record<string, unknown>) ?? {};
      if (vs.show_in_discover === false) return false;
      return true;
    })
    .filter((p) => {
      const layer0 = (p.layer0 as Record<string, unknown>) ?? {};
      const name = (layer0.name as string) ?? "";
      const manifesto = (layer0.manifesto as string) ?? "";
      const vTags = (layer0.value_tags as string[]) ?? [];
      const iTags = (layer0.interest_tags as string[]) ?? [];

      if (search) {
        const s = search.toLowerCase();
        const match =
          name.toLowerCase().includes(s) ||
          manifesto.toLowerCase().includes(s) ||
          (p.username ?? "").toLowerCase().includes(s) ||
          vTags.some((t) => t.toLowerCase().includes(s)) ||
          iTags.some((t) => t.toLowerCase().includes(s)) ||
          (searchTagIds.length > 0 &&
            (vTags.some((t) => searchTagIds.includes(t)) ||
              iTags.some((t) => searchTagIds.includes(t))));
        if (!match) return false;
      }
      if (valueTag && !vTags.includes(valueTag)) return false;
      if (interestTag && !iTags.includes(interestTag)) return false;
      return true;
    })
    .map((p) => {
      const layer0 = (p.layer0 as Record<string, unknown>) ?? {};
      const theirValueTags = (layer0.value_tags as string[]) ?? [];
      const theirInterestTags = (layer0.interest_tags as string[]) ?? [];
      const consensus = user
        ? calculateConsensusScore(
            { value_tags: myLayer0.value_tags, interest_tags: myLayer0.interest_tags },
            { value_tags: theirValueTags, interest_tags: theirInterestTags }
          )
        : { score: 0, valueScore: 0, interestScore: 0, valueOverlap: [] as string[], interestOverlap: [] as string[] };

      return {
        id: p.id,
        username: p.username,
        layer0: layer0,
        consensusScore: consensus.score,
        valueScore: consensus.valueScore,
        interestScore: consensus.interestScore,
        valueOverlap: consensus.valueOverlap,
        interestOverlap: consensus.interestOverlap,
      };
    })
    .filter((r) => r.consensusScore >= minConsensus)
    .sort((a, b) => b.consensusScore - a.consensusScore)
    .slice(0, limit);

  return NextResponse.json(results);
}
