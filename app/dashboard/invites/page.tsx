"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Plus, Loader2, Link as LinkIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Invite {
  code: string;
  used_by: string | null;
  used_at: string | null;
  expires_at: string;
  created_at: string;
}

export default function InvitesDashboard() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [quota, setQuota] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [generateCount, setGenerateCount] = useState(1);

  const fetchInvites = () => {
    setLoading(true);
    fetch("/api/invites/list")
      .then((r) => r.json())
      .then((data) => {
        setInvites(data.invites ?? []);
        setQuota(data.quota ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/invites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchInvites(); // Refresh list
      } else {
        alert(data.error || "生成失败");
      }
    } catch {
      alert("网络错误");
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteLink = async (code: string) => {
    const link = `${window.location.origin}/auth/sign-up?invite=${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">邀请管理</h1>
        <p className="text-muted-foreground mt-1">
          生成邀请码，邀请志同道合的人加入社区
        </p>
      </div>

      {/* Quota + Generate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">生成邀请码</CardTitle>
          <CardDescription>
            剩余额度：<span className="font-semibold text-foreground">{quota}</span> 个
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="number"
              min={1}
              max={5}
              value={generateCount}
              onChange={(e) => setGenerateCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20"
            />
            <Button
              onClick={handleGenerate}
              disabled={generating || quota <= 0}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              生成 {generateCount} 个邀请码
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">邀请记录</CardTitle>
          <CardDescription>已生成的邀请码及其使用状态</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-center py-4">加载中...</p>
          ) : invites.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              还没有邀请码，点击上方按钮生成
            </p>
          ) : (
            <div className="space-y-2">
              {invites.map((invite) => {
                const isExpired = new Date(invite.expires_at) < new Date();
                const isUsed = !!invite.used_by;
                const isActive = !isUsed && !isExpired;
                const inviteLink = `${baseUrl}/auth/sign-up?invite=${invite.code}`;

                return (
                  <div
                    key={invite.code}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-lg tracking-widest bg-muted px-3 py-1 rounded">
                        {invite.code}
                      </code>
                      <div className="flex flex-col">
                        {isActive && (
                          <span className="text-xs text-green-600 font-medium">
                            有效（未使用）
                          </span>
                        )}
                        {isUsed && (
                          <span className="text-xs text-muted-foreground">
                            已使用 · {new Date(invite.used_at!).toLocaleDateString()}
                          </span>
                        )}
                        {isExpired && !isUsed && (
                          <span className="text-xs text-red-500">
                            已过期 · {new Date(invite.expires_at).toLocaleDateString()}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          过期时间：{new Date(invite.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isActive && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => copyCode(invite.code)}
                          >
                            {copiedCode === invite.code ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            复制码
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="gap-1"
                            onClick={() => copyInviteLink(invite.code)}
                          >
                            {copiedCode === invite.code ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <LinkIcon className="w-3.5 h-3.5" />
                            )}
                            复制链接
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help */}
      <div className="text-sm text-muted-foreground space-y-1">
        <p>
          邀请链接格式：<code className="bg-muted px-1 rounded">{baseUrl}/auth/sign-up?invite=XXXXXXXX</code>
        </p>
        <p>
          每个新注册用户默认获得 5 个邀请额度。邀请码 30 天后过期。
        </p>
        <Link href="/discover" className="text-primary hover:underline inline-flex items-center gap-1">
          <ExternalLink className="w-3.5 h-3.5" />
          去发现同道
        </Link>
      </div>
    </div>
  );
}
