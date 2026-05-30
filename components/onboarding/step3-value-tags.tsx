"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Layer0FormData } from "@/lib/types/layer0";

interface Step3ValueTagsProps {
  data: Layer0FormData;
  onChange: (updates: Partial<Layer0FormData>) => void;
}

interface TagItem {
  id: string;
  label: string;
}

export function Step3ValueTags({ data, onChange }: Step3ValueTagsProps) {
  const [tags, setTags] = useState<TagItem[]>([]);

  useEffect(() => {
    fetch("/api/tags/values")
      .then((r) => r.json())
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  const toggle = (id: string) => {
    const current = data.value_tags;
    const next = current.includes(id)
      ? current.filter((t) => t !== id)
      : current.length < 5
        ? [...current, id]
        : current;
    onChange({ value_tags: next });
  };

  const selected = data.value_tags.length;
  const valid = selected >= 3 && selected <= 5;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        选择 3-5 个最能代表你价值观的标签
      </p>
      <div className={`text-sm mb-2 ${valid ? "text-muted-foreground" : "text-amber-600"}`}>
        已选 {selected} / 5 {selected < 3 && "（至少 3 个）"}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Badge
            key={t.id}
            variant={data.value_tags.includes(t.id) ? "default" : "outline"}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggle(t.id)}
          >
            {t.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
