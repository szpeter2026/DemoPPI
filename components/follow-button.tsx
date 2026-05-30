"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  initialFollowing?: boolean;
  onToggle?: (following: boolean) => void;
  size?: "sm" | "default";
  className?: string;
}

export function FollowButton({
  targetUserId,
  initialFollowing = false,
  onToggle,
  size = "default",
  className,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (following) {
        await fetch("/api/connections/unfollow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: targetUserId }),
        });
      } else {
        await fetch("/api/connections/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followingId: targetUserId }),
        });
      }
      setFollowing(!following);
      onToggle?.(!following);
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <Button
      variant={following ? "outline" : "default"}
      size={size === "sm" ? "sm" : "sm"}
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : following ? (
        <>
          <UserMinus className={iconSize} />
          已关注
        </>
      ) : (
        <>
          <UserPlus className={iconSize} />
          关注
        </>
      )}
    </Button>
  );
}
