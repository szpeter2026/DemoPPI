import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

async function ProtectedContent() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const sub = data.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("layer0")
    .eq("id", sub)
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

  if (!hasCompleteLayer0) {
    redirect("/onboarding");
  }

  const name = layer0?.name as string;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">你好，{name} 👋</h1>
        <p className="text-muted-foreground">欢迎回来，你的 Layer 0 名片已完成</p>
      </div>

      <div>
        <h2 className="font-bold text-xl mb-3">发现同道</h2>
        <p className="text-muted-foreground mb-4">
          基于价值观与兴趣共识，为你推荐可能志同道合的人
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          去发现 →
        </Link>
      </div>
    </div>
  );
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full max-w-2xl mx-auto py-12 px-4">
      <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
        <ProtectedContent />
      </Suspense>
    </div>
  );
}
