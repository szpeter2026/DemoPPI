import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon } from "lucide-react";
import { FetchDataSteps } from "@/components/tutorial/fetch-data-steps";
import { Suspense } from "react";
async function UserDetails() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const sub = data.claims.sub as string | undefined;
  if (sub) {
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
  }

  return JSON.stringify(data.claims, null, 2);
}

export default function ProtectedPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          欢迎回来！你的 Layer 0 名片已完成
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">用户信息</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          <Suspense>
            <UserDetails />
          </Suspense>
        </pre>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">发现同道</h2>
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
      <div>
        <h2 className="font-bold text-2xl mb-4">下一步</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
