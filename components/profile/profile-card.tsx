"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConsensusDetail } from "@/components/consensus/consensus-detail";
import { User } from "lucide-react";
import Link from "next/link";

interface ProfileCardProps {
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
  consensusScore?: number;
  valueScore?: number;
  interestScore?: number;
  valueOverlap?: string[];
  interestOverlap?: string[];
  valueLabels?: Record<string, string>;
  interestLabels?: Record<string, string>;
  variant?: "compact" | "full";
  showConsensus?: boolean;
}

export function ProfileCard({
  id,
  username,
  layer0,
  consensusScore = 0,
  valueScore = 0,
  interestScore = 0,
  valueOverlap = [],
  interestOverlap = [],
  valueLabels = {},
  interestLabels = {},
  variant = "full",
  showConsensus = true,
}: ProfileCardProps) {
  const profileUrl = `/p/${username || id}`;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-4">
          <Link href={profileUrl} className="shrink-0">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden ring-2 ring-background">
              {layer0.avatar ? (
                <img
                  src={layer0.avatar}
                  alt={layer0.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-muted-foreground" />
              )}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={profileUrl} className="block hover:underline">
              <h3 className="font-semibold truncate">
                {layer0.name || username || "未设置名称"}
              </h3>
            </Link>
            {layer0.city && (
              <p className="text-sm text-muted-foreground">{layer0.city}</p>
            )}
            {showConsensus && consensusScore > 0 && (
              <ConsensusDetail
                score={consensusScore}
                valueScore={valueScore}
                interestScore={interestScore}
                valueOverlap={valueOverlap}
                interestOverlap={interestOverlap}
                valueLabels={valueLabels}
                interestLabels={interestLabels}
                trigger={
                  <button
                    type="button"
                    className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    共识度 {Math.round(consensusScore)}%
                    <span className="text-xs">查看详情</span>
                  </button>
                }
              />
            )}
          </div>
        </div>
      </CardHeader>
      {variant === "full" && (
        <CardContent className="pt-0 space-y-3">
          {layer0.manifesto && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {layer0.manifesto}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {(layer0.value_tags ?? []).slice(0, 5).map((tagId) => (
              <span
                key={tagId}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
              >
                {valueLabels[tagId] ?? tagId}
              </span>
            ))}
          </div>
          {(layer0.interest_tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(layer0.interest_tags ?? []).slice(0, 4).map((tagId) => (
                <span
                  key={tagId}
                  className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-xs text-secondary-foreground"
                >
                  {interestLabels[tagId] ?? tagId}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
