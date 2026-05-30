/**
 * 共识度计算算法
 * 基于 PRODUCT_SPEC 5.1 设计
 */

import type { Layer0 } from "@/lib/types/database";

export interface ConsensusResult {
  score: number;
  valueScore: number;
  interestScore: number;
  valueOverlap: string[];
  interestOverlap: string[];
}

interface Layer0Input {
  value_tags?: string[];
  interest_tags?: string[];
}

/**
 * 计算两个用户的共识度（0-100）
 * Phase 1: 价值观 40% + 兴趣 30%（共同社区、互相背书 Phase 2）
 */
export function calculateConsensusScore(
  a: Layer0Input,
  b: Layer0Input
): ConsensusResult {
  const aValues = new Set(a.value_tags ?? []);
  const aInterests = new Set(a.interest_tags ?? []);
  const bValues = new Set(b.value_tags ?? []);
  const bInterests = new Set(b.interest_tags ?? []);

  const valueOverlap = [...aValues].filter((x) => bValues.has(x));
  const interestOverlap = [...aInterests].filter((x) => bInterests.has(x));

  // 价值观标签重合度（40%），满3个重合得满分
  const valueScore = Math.min(valueOverlap.length / 3, 1) * 40;

  // 兴趣标签重合度（30%），满2个重合得满分
  const interestScore = Math.min(interestOverlap.length / 2, 1) * 30;

  // Phase 1 总分 70，缩放到 0-100
  const rawTotal = valueScore + interestScore;
  const score = Math.round((rawTotal / 70) * 1000) / 10;

  return {
    score: Math.min(score, 100),
    valueScore,
    interestScore,
    valueOverlap,
    interestOverlap,
  };
}
