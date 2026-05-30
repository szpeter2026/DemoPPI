import { Suspense } from "react";
import { DiscoverPageWithAuth } from "./discover-with-auth";

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <DiscoverPageWithAuth />
    </Suspense>
  );
}
