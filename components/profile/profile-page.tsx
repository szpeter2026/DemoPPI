"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConsensusDetail } from "@/components/consensus/consensus-detail";
import { FollowButton } from "@/components/follow-button";
import { User, Share2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

interface ProfilePageProps {
  profile: {
    id: string;
    username: string | null;
    layer0: Record<string, unknown>;
    layer1: Record<string, unknown>;
    visibility_settings?: Record<string, unknown>;
  };
  currentUserId: string | null;
}

export function ProfilePage({ profile, currentUserId }: ProfilePageProps) {
  const [consensus, setConsensus] = useState<{
    score: number;
    valueScore: number;
    interestScore: number;
    valueOverlap: string[];
    interestOverlap: string[];
  } | null>(null);
  const [valueLabels, setValueLabels] = useState<Record<string, string>>({});
  const [interestLabels, setInterestLabels] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [connectionLoaded, setConnectionLoaded] = useState(false);

  const layer0 = profile.layer0 ?? {};
  const name = (layer0.name as string) ?? profile.username ?? "未设置名称";
  const avatar = layer0.avatar as string;
  const manifesto = layer0.manifesto as string;
  const city = layer0.city as string;
  const valueTags = (layer0.value_tags as string[]) ?? [];
  const interestTags = (layer0.interest_tags as string[]) ?? [];

  const isOwnProfile = currentUserId === profile.id;

  useEffect(() => {
    if (currentUserId && !isOwnProfile) {
      fetch(`/api/consensus/${profile.id}`)
        .then((r) => r.json())
        .then(setConsensus)
        .catch(() => setConsensus(null));
      // Check follow status
      fetch(`/api/connections/status?userId=${profile.id}`)
        .then((r) => r.json())
        .then((data) => {
          setIsFollowing(data.following);
          setConnectionLoaded(true);
        })
        .catch(() => setConnectionLoaded(true));
    }
  }, [currentUserId, profile.id, isOwnProfile]);

  useEffect(() => {
    Promise.all([
      fetch("/api/tags/values").then((r) => r.json()),
      fetch("/api/tags/interests").then((r) => r.json()),
    ]).then(([values, interests]) => {
      setValueLabels(
        (values as { id: string; label: string }[]).reduce(
          (acc, t) => ({ ...acc, [t.id]: t.label }),
          {}
        )
      );
      setInterestLabels(
        (interests as { id: string; label: string }[]).reduce(
          (acc, t) => ({ ...acc, [t.id]: t.label }),
          {}
        )
      );
    });
  }, []);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${profile.username ?? profile.id}`
      : "";

  const handleCopyLink = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader className="text-center pb-2">
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-4 ring-background shadow-lg">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{name}</h1>
              {city && (
                <p className="text-muted-foreground mt-1">{city}</p>
              )}
            </div>
            {(consensus || isOwnProfile) && (
              <div className="flex items-center gap-4">
                {!isOwnProfile && consensus && (
                  <ConsensusDetail
                    score={consensus.score}
                    valueScore={consensus.valueScore}
                    interestScore={consensus.interestScore}
                    valueOverlap={consensus.valueOverlap}
                    interestOverlap={consensus.interestOverlap}
                    valueLabels={valueLabels}
                    interestLabels={interestLabels}
                    trigger={
                      <Button variant="outline" size="sm">
                        共识度 {Math.round(consensus.score)}%
                      </Button>
                    }
                  />
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      分享名片
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="center">
                    <div className="space-y-4">
                      <p className="text-sm font-medium">分享我的名片</p>
                      {shareUrl && (
                        <div className="flex justify-center rounded-lg bg-muted p-4">
                          <QRCodeSVG value={shareUrl} size={160} level="M" />
                        </div>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2"
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            已复制链接
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            复制链接
                          </>
                        )}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {manifesto && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                个人宣言
              </h3>
              <p className="text-base">{manifesto}</p>
            </div>
          )}
          {valueTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                价值观
              </h3>
              <div className="flex flex-wrap gap-2">
                {valueTags.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-md bg-primary/10 px-3 py-1 text-sm text-primary"
                  >
                    {valueLabels[id] ?? id}
                  </span>
                ))}
              </div>
            </div>
          )}
          {interestTags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                兴趣
              </h3>
              <div className="flex flex-wrap gap-2">
                {interestTags.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {interestLabels[id] ?? id}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isOwnProfile && currentUserId && connectionLoaded && (
        <div className="flex justify-center">
          <FollowButton
            targetUserId={profile.id}
            initialFollowing={isFollowing}
            onToggle={(f) => setIsFollowing(f)}
          />
        </div>
      )}

      {!currentUserId && (
        <div className="text-center">
          <Link href="/auth/login">
            <Button variant="outline">登录查看共识度</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
