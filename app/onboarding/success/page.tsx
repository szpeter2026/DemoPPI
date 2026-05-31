import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SuccessPageClient } from "./success-client";

export default async function OnboardingSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // 检查是否已完成 Layer0
  const { data: profile } = await supabase
    .from("profiles")
    .select("layer0")
    .eq("id", user.id)
    .single();

  const layer0 = (profile?.layer0 as Record<string, unknown>) ?? {};
  if (!layer0 || Object.keys(layer0).length === 0) {
    redirect("/onboarding");
  }

  return <SuccessPageClient name={(layer0.name as string) ?? "用户"} />;
}
