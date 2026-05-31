import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PricingPageContent } from "@/components/pricing/pricing-page";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 未登录也可以看定价页
  let tier = "free";
  if (user) {
    const { data } = await supabase
      .from("user_tiers")
      .select("tier")
      .eq("user_id", user.id)
      .single();
    if (data?.tier) tier = data.tier;
  }

  return <PricingPageContent currentTier={tier} isLoggedIn={!!user} />;
}
