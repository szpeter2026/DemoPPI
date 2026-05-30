import { Suspense } from "react";
import { ProfileWithData } from "./profile-with-data";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function ProfileRoute({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="animate-pulse text-muted-foreground">加载中...</p>
        </div>
      }
    >
      <ProfileWithData params={params} />
    </Suspense>
  );
}
