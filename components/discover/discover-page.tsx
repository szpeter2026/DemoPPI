"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileCard } from "@/components/profile/profile-card";
import { FollowButton } from "@/components/follow-button";
import { Search, Filter, ChevronDown, Shield, Scale, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DiscoverUser {
  id: string;
  username: string | null;
  layer0: {
    name?: string;
    avatar?: string;
    manifesto?: string;
    value_tags?: string[];
    interest_tags?: string[];
    city?: string;
  };
  consensusScore: number;
  valueScore: number;
  interestScore: number;
  valueOverlap: string[];
  interestOverlap: string[];
}

interface DiscoverPageProps {
  userId: string;
}

/** 社区自治引导横幅：核心差异化是治理权，不是配额 */
function GovernanceBanner() {
  return (
    <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 text-primary">
        <Scale className="w-5 h-5" />
        <span className="font-medium">参与社区治理</span>
      </div>
      <p className="text-sm text-muted-foreground flex-1">
        升级到治理者身份，发起提案、参与投票，用你的声音塑造社区的未来
      </p>
      <Link href="/pricing">
        <Button size="sm" variant="outline" className="gap-1">
          了解治理权限
          <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}

/** 防刷提示（仅在真正触发防刷时显示，不主动展示） */
function AntiAbuseNotice() {
  return (
    <div className="rounded-lg border border-muted bg-muted/30 p-3 flex items-center gap-2 text-sm text-muted-foreground">
      <Shield className="w-4 h-4" />
      <span>操作过于频繁，请稍后再试（防刷保护）</span>
    </div>
  );
}

export function DiscoverPage({ userId }: DiscoverPageProps) {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [valueTag, setValueTag] = useState("");
  const [interestTag, setInterestTag] = useState("");
  const [minConsensus, setMinConsensus] = useState(0);
  const [valueLabels, setValueLabels] = useState<Record<string, string>>({});
  const [interestLabels, setInterestLabels] = useState<Record<string, string>>({});
  const [valueTags, setValueTags] = useState<{ id: string; label: string }[]>([]);
  const [interestTags, setInterestTags] = useState<
    { id: string; label: string }[]
  >([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // 防刷状态（仅当真正触发时显示）
  const [antiAbuseTriggered, setAntiAbuseTriggered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchDebounced) params.set("search", searchDebounced);
    if (valueTag) params.set("value_tag", valueTag);
    if (interestTag) params.set("interest_tag", interestTag);
    if (minConsensus > 0) params.set("min_consensus", String(minConsensus));
    params.set("limit", "50");

    fetch(`/api/discover?${params}`)
      .then((r) => {
        if (r.status === 429) {
          setAntiAbuseTriggered(true);
          return [];
        }
        return r.json();
      })
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [searchDebounced, valueTag, interestTag, minConsensus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    Promise.all([
      fetch("/api/tags/values").then((r) => r.json()),
      fetch("/api/tags/interests").then((r) => r.json()),
    ]).then(([values, interests]) => {
      setValueTags(values ?? []);
      setInterestTags(interests ?? []);
      setValueLabels(
        (values ?? []).reduce(
          (acc: Record<string, string>, t: { id: string; label: string }) => ({
            ...acc,
            [t.id]: t.label,
          }),
          {}
        )
      );
      setInterestLabels(
        (interests ?? []).reduce(
          (acc: Record<string, string>, t: { id: string; label: string }) => ({
            ...acc,
            [t.id]: t.label,
          }),
          {}
        )
      );
    });
  }, []);

  const hasFilters = valueTag || interestTag || minConsensus > 0;

  const toggleFollow = (targetId: string, following: boolean) => {
    setFollowedUsers((prev) => {
      const next = new Set(prev);
      if (following) {
        next.add(targetId);
      } else {
        next.delete(targetId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setValueTag("");
    setInterestTag("");
    setMinConsensus(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">发现同道</h1>
          <p className="text-muted-foreground mt-1">
            基于价值观与兴趣共识，探索志同道合的人
          </p>
        </div>
      </div>

      {/* 社区自治引导（核心差异化：治理权，不是配额） */}
      <GovernanceBanner />

      {/* 防刷提示（仅在真正触发时显示） */}
      {antiAbuseTriggered && <AntiAbuseNotice />}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索姓名、宣言、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                价值观
                {valueTag && (
                  <span className="text-primary">
                    · {valueLabels[valueTag] ?? valueTag}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => setValueTag("")}>
                全部
              </DropdownMenuItem>
              {valueTags.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setValueTag(t.id)}
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                兴趣
                {interestTag && (
                  <span className="text-primary">
                    · {interestLabels[interestTag] ?? interestTag}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
              <DropdownMenuItem onClick={() => setInterestTag("")}>
                全部
              </DropdownMenuItem>
              {interestTags.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setInterestTag(t.id)}
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                共识度 ≥ {minConsensus}%
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[0, 30, 50, 70, 90].map((n) => (
                <DropdownMenuItem
                  key={n}
                  onClick={() => setMinConsensus(n)}
                >
                  ≥ {n}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              清除筛选
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center min-h-[300px] items-center">
          <p className="text-muted-foreground animate-pulse">加载中...</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>暂无匹配用户</p>
            <p className="text-sm mt-2">
              尝试调整搜索或筛选条件，或完善你的名片后获得更多推荐
            </p>
            <Link
              href="/onboarding"
              className="inline-block mt-4 text-primary hover:underline"
            >
              去完善名片 →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-2">
              <ProfileCard
                id={u.id}
                username={u.username}
                layer0={u.layer0}
                consensusScore={u.consensusScore}
                valueScore={u.valueScore}
                interestScore={u.interestScore}
                valueOverlap={u.valueOverlap}
                interestOverlap={u.interestOverlap}
                valueLabels={valueLabels}
                interestLabels={interestLabels}
                variant="full"
                showConsensus={true}
              />
              <div className="flex justify-end">
                <FollowButton
                  targetUserId={u.id}
                  initialFollowing={followedUsers.has(u.id)}
                  onToggle={(f) => toggleFollow(u.id, f)}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
