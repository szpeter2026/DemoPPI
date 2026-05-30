export interface Layer0FormData {
  name: string;
  avatar: string;
  manifesto: string;
  value_tags: string[];
  interest_tags: string[];
  city: string;
}

export const LAYER0_STORAGE_KEY = "onboarding-layer0-draft";
