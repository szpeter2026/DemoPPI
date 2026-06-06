/**
 * Type patches for broken npm packages
 *
 * - @supabase/auth-js@2.106.2: GoTrueClient.d.ts is missing from dist
 * - lucide-react@0.511.0: dist/lucide-react.d.ts is missing
 */

// ============================================
// Patch: @supabase/supabase-js missing auth methods
// ============================================

declare module "@supabase/supabase-js" {
  interface SupabaseAuthClient {
    signUp(credentials: {
      email: string;
      password: string;
      options?: {
        emailRedirectTo?: string;
        data?: Record<string, unknown>;
      };
    }): Promise<{
      data: { user: { id: string; user_metadata?: Record<string, unknown> } | null; session: { access_token: string; refresh_token: string } | null };
      error: { message: string } | null;
    }>;
    signInWithPassword(credentials: {
      email: string;
      password: string;
    }): Promise<{
      data: { user: { id: string; user_metadata?: Record<string, unknown> } | null; session: { access_token: string; refresh_token: string } | null };
      error: { message: string } | null;
    }>;
    signOut(options?: { scope?: "global" | "local" | "others" }): Promise<{ error: { message: string } | null }>;
    getUser(jwt?: string): Promise<{ data: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null }; error: { message: string } | null }>;
    getClaims(jwt?: string, options?: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
    getSession(): Promise<{ data: { session: { access_token: string; refresh_token: string } | null }; error: { message: string } | null }>;
    verifyOtp(params: { email: string; token: string; type: string }): Promise<{ data: unknown; error: { message: string } | null }>;
    resetPasswordForEmail(email: string, options?: { redirectTo?: string }): Promise<{ data: unknown; error: { message: string } | null }>;
    updateUser(attributes: { password?: string; email?: string; data?: Record<string, unknown> }, options?: Record<string, unknown>): Promise<{ data: { user: { id: string } | null }; error: { message: string } | null }>;
    signInWithOtp(credentials: { email: string; options?: Record<string, unknown> }): Promise<{ data: unknown; error: { message: string } | null }>;
    onAuthStateChange(callback: (event: string, session: unknown) => void): { data: { subscription: { unsubscribe: () => void } } };
    admin: {
      generateLink(params: { type: string; email: string }): Promise<{ data: { properties?: { action_link?: string } }; error: { message: string } | null }>;
      signOut(jwt: string): Promise<{ error: { message: string } | null }>;
      inviteUserByEmail(email: string, options?: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }>;
      createUser(attributes: Record<string, unknown>): Promise<{ data: { user: { id: string } }; error: { message: string } | null }>;
      listUsers(params?: Record<string, unknown>): Promise<{ data: { users: Array<{ id: string }> }; error: { message: string } | null }>;
      getUserById(uid: string): Promise<{ data: { user: { id: string } }; error: { message: string } | null }>;
      updateUserById(uid: string, attributes: Record<string, unknown>): Promise<{ data: { user: { id: string } }; error: { message: string } | null }>;
      deleteUser(uid: string): Promise<{ data: unknown; error: { message: string } | null }>;
    };
  }
}

// ============================================
// Patch: lucide-react missing type declarations
// ============================================

declare module "lucide-react" {
  import type { FC, SVGProps } from "react";

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = FC<LucideProps>;

  export const ArrowRight: LucideIcon;
  export const Award: LucideIcon;
  export const Brain: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Circle: LucideIcon;
  export const Copy: LucideIcon;
  export const Crown: LucideIcon;
  export const Download: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Filter: LucideIcon;
  export const Info: LucideIcon;
  export const Laptop: LucideIcon;
  export const Link: LucideIcon;
  export const Loader2: LucideIcon;
  export const Moon: LucideIcon;
  export const Plus: LucideIcon;
  export const Scale: LucideIcon;
  export const Search: LucideIcon;
  export const Share2: LucideIcon;
  export const Shield: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Sun: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserMinus: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const Vote: LucideIcon;
  export const X: LucideIcon;
}

// ============================================
// Patch: window.__wxjs_environment for WeChat mini program
// ============================================

interface Window {
  __wxjs_environment?: string;
}
