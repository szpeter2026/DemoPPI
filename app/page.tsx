import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
          <div className="flex gap-5 items-center font-semibold">
            <Link href={"/"}>DemoPPI</Link>
          </div>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center gap-8 px-5 py-32 text-center">
        <div className="flex flex-col gap-4 items-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            共识网络
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            基于价值观匹配的超级个体身份主权社区
          </p>
        </div>

        <p className="max-w-lg text-muted-foreground leading-relaxed">
          不靠算法推荐，不靠粉丝数排序。DemoPPI
          通过逐层递进的身份协议，让你被真正理解你的人发现。
        </p>

        <div className="flex gap-4 mt-4">
          <Link
            href="/auth/sign-up"
            className="bg-foreground text-background px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            开始使用
          </Link>
          <Link
            href="/discover"
            className="border border-foreground/20 px-6 py-3 rounded-lg font-medium hover:bg-foreground/5 transition"
          >
            探索社区
          </Link>
        </div>
      </section>

      {/* Principles */}
      <section className="w-full border-t border-foreground/10 py-24 px-5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-3">
            <div className="text-3xl">🛡️</div>
            <h3 className="text-lg font-semibold">身份主权</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              你的身份数据由你掌控。Layer 0 到 Layer 2
              逐层开放，永远保持撤回权。
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-3xl">🤝</div>
            <h3 className="text-lg font-semibold">共识匹配</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              基于价值观标签的 Jaccard 相似度算法，找到真正同频的人。
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="text-3xl">🔒</div>
            <h3 className="text-lg font-semibold">邀请制生长</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              每个用户初始 5 个邀请码。有机生长，拒绝流量炒作。
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full flex items-center justify-center border-t border-foreground/10 mx-auto text-center text-xs gap-8 py-12 px-5">
        <p className="text-muted-foreground">DemoPPI · 共识网络</p>
        <p className="text-muted-foreground">
          Powered by{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
          {" "} + {" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Next.js
          </a>
        </p>
        <ThemeSwitcher />
      </footer>
    </main>
  );
}
