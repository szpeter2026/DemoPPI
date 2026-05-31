export interface Layer0FormData {
  name: string;
  avatar: string;
  manifesto: string;
  value_tags: string[];
  interest_tags: string[];
  city: string;
  mbti_type: string; // 16 种 MBTI 类型，空字符串表示跳过
}

export const LAYER0_STORAGE_KEY = "onboarding-layer0-draft";
