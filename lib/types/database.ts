/**
 * Consensus Network - Database Types
 * 与 supabase/migrations 中的 Schema 对应
 */

export interface Layer0 {
  name?: string;
  avatar?: string;
  manifesto?: string;
  value_tags?: string[];
  interest_tags?: string[];
  city?: string;
}

export interface Profile {
  id: string;
  username: string | null;
  layer0: Layer0;
  layer1: Record<string, unknown>;
  layer2: Record<string, unknown>;
  visibility_settings: {
    default_layer?: number;
    layer_1_rule?: string;
    show_in_discover?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: number;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ValueTag {
  id: string;
  label: string;
  sort_order: number;
}

export interface InterestTag {
  id: string;
  label: string;
  category: string | null;
  sort_order: number;
}
