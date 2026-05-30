"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import type { Layer0FormData } from "@/lib/types/layer0";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<Partial<Layer0FormData> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/login");
        return;
      }
      setUserId(user.id);

      // 检查是否已有完整 Layer0
      const { data: profile } = await supabase
        .from("profiles")
        .select("layer0")
        .eq("id", user.id)
        .single();

      const layer0 = profile?.layer0 as Record<string, unknown> | null;
      const hasCompleteLayer0 =
        layer0 &&
        typeof layer0.name === "string" &&
        layer0.name.length > 0 &&
        Array.isArray(layer0.value_tags) &&
        layer0.value_tags.length >= 3 &&
        Array.isArray(layer0.interest_tags) &&
        layer0.interest_tags.length >= 3 &&
        typeof layer0.manifesto === "string" &&
        layer0.manifesto.length >= 20;

      if (hasCompleteLayer0) {
        router.replace("/protected");
        return;
      }

      // 加载草稿或已有数据
      const draft = typeof window !== "undefined" ? localStorage.getItem("onboarding-layer0-draft") : null;
      if (draft) {
        try {
          setInitialData(JSON.parse(draft) as Partial<Layer0FormData>);
        } catch {
          setInitialData({});
        }
      } else if (layer0 && typeof layer0 === "object") {
        setInitialData({
          name: (layer0.name as string) || "",
          avatar: (layer0.avatar as string) || "",
          manifesto: (layer0.manifesto as string) || "",
          value_tags: Array.isArray(layer0.value_tags) ? layer0.value_tags : [],
          interest_tags: Array.isArray(layer0.interest_tags) ? layer0.interest_tags : [],
          city: (layer0.city as string) || "",
        });
      } else {
        setInitialData({});
      }
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading || !userId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return <OnboardingWizard userId={userId} initialData={initialData ?? {}} />;
}
