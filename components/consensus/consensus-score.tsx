"use client";

import { cn } from "@/lib/utils";

interface ConsensusScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ConsensusScore({
  score,
  size = "md",
  className,
}: ConsensusScoreProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-semibold",
  };

  const colorClass =
    score >= 70
      ? "text-green-600 dark:text-green-400"
      : score >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";

  return (
    <span
      className={cn(sizeClasses[size], colorClass, className)}
      title={`共识度 ${score}%`}
    >
      {Math.round(score)}%
    </span>
  );
}
