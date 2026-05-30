/**
 * 推荐引擎：基于共识度推荐可连接用户
 */

import { createClient } from "@/lib/supabase/server";
import { calculateConsensusScore } from "./calculate";

export interface RecommendedUser {
  id: string;
  username: string | null;
  layer0: {
    name?: string;
    avatar?: string;
    manifesto?: string;
    value_tags?: string[];
    interest_tags?: string[];
    city?: string;
  };
  consensusScore: number;
  valueScore: number;
  interestScore: number;
  valueOverlap: string[];
  interestOverlap: string[];
}

const MIN_CONSENSUS = 50;

/**
 * 为指定用户推荐连接（按共识度排序）
 */
export async function recommendConnections(
  userId: string,
  topN: number = 10
): Promise<RecommendedUser[]> {
  const supabase = await createClient();

  // 1. 获取当前用户 profile
  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, layer0")
    .eq("id", userId)
    .single();

  if (meError || !me) return [];

  const myLayer0 = (me.layer0 as Record<string, unknown>) ?? {};
  const myValueTags = (myLayer0.value_tags as string[]) ?? [];
  const myInterestTags = (myLayer0.interest_tags as string[]) ?? [];

  if (myValueTags.length === 0 && myInterestTags.length === 0) {
    return [];
  }

  // 2. 获取已连接用户 ID（关注 + 被关注）
  const { data: connections } = await supabase
    .from("connections")
    .select("follower_id, following_id")
    .or(`follower_id.eq.${userId},following_id.eq.${userId}`);

  const connectedIds = new Set<string>();
  connectedIds.add(userId);
  for (const c of connections ?? []) {
    connectedIds.add(c.follower_id);
    connectedIds.add(c.following_id);
  }

  // 3. 获取其他用户（排除已连接）
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, layer0")
    .neq("id", userId);

  if (!profiles?.length) return [];

  const results: RecommendedUser[] = [];

  for (const p of profiles) {
    if (connectedIds.has(p.id)) continue;

    const layer0 = (p.layer0 as Record<string, unknown>) ?? {};
    const theirValueTags = (layer0.value_tags as string[]) ?? [];
    const theirInterestTags = (layer0.interest_tags as string[]) ?? [];

    if (theirValueTags.length === 0 && theirInterestTags.length === 0) continue;

    const result = calculateConsensusScore(
      { value_tags: myValueTags, interest_tags: myInterestTags },
      { value_tags: theirValueTags, interest_tags: theirInterestTags }
    );

    if (result.score < MIN_CONSENSUS) continue;

    results.push({
      id: p.id,
      username: p.username,
      layer0: {
        name: layer0.name as string,
        avatar: layer0.avatar as string,
        manifesto: layer0.manifesto as string,
        value_tags: theirValueTags,
        interest_tags: theirInterestTags,
        city: layer0.city as string,
      },
      consensusScore: result.score,
      valueScore: result.valueScore,
      interestScore: result.interestScore,
      valueOverlap: result.valueOverlap,
      interestOverlap: result.interestOverlap,
    });
  }

  results.sort((a, b) => b.consensusScore - a.consensusScore);
  return results.slice(0, topN);
}
