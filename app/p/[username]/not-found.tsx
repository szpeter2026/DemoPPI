import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">用户不存在</h1>
      <p className="text-muted-foreground">该用户可能尚未设置用户名，或链接有误</p>
      <Button asChild>
        <Link href="/discover">去发现</Link>
      </Button>
    </div>
  );
}
