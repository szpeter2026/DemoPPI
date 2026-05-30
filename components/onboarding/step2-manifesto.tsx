"use client";

import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import type { Layer0FormData } from "@/lib/types/layer0";

interface Step2ManifestoProps {
  data: Layer0FormData;
  onChange: (updates: Partial<Layer0FormData>) => void;
}

export function Step2Manifesto({ data, onChange }: Step2ManifestoProps) {
  const len = data.manifesto.length;
  const valid = len >= 20 && len <= 50;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="manifesto">个人宣言 *</Label>
        <p className="text-sm text-muted-foreground">
          用 20-50 字表达你的核心理念，让他人快速了解你
        </p>
        <textarea
          id="manifesto"
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="例：用技术连接孤岛，用共识重构信任"
          value={data.manifesto}
          onChange={(e) => onChange({ manifesto: e.target.value })}
          maxLength={50}
        />
        <div className={`text-sm ${valid ? "text-muted-foreground" : "text-amber-600"}`}>
          {len} / 50 字 {len > 0 && len < 20 && "（至少 20 字）"}
        </div>
      </div>
    </div>
  );
}
