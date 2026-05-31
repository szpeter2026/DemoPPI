"use client";

import { useEffect, useState } from "react";
import type { Layer0FormData } from "@/lib/types/layer0";
import { User } from "lucide-react";

interface Step5PreviewProps {
  data: Layer0FormData;
}

interface TagLabel {
  id: string;
  label: string;
}

export function Step5Preview({ data }: Step5PreviewProps) {
  const [valueLabels, setValueLabels] = useState<Record<string, string>>({});
  const [interestLabels, setInterestLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/tags/values").then((r) => r.json()),
      fetch("/api/tags/interests").then((r) => r.json()),
    ]).then(([values, interests]) => {
      setValueLabels(
        (values as TagLabel[]).reduce((acc, t) => ({ ...acc, [t.id]: t.label }), {})
      );
      setInterestLabels(
        (interests as TagLabel[]).reduce((acc, t) => ({ ...acc, [t.id]: t.label }), {})
      );
    });
  }, []);

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0 w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {data.avatar ? (
            <img
              src={data.avatar}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg">{data.name || "未填写"}</h3>
          {data.city && (
            <p className="text-sm text-muted-foreground">{data.city}</p>
          )}
          <p className="text-sm leading-relaxed">{data.manifesto || "未填写"}</p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {data.value_tags.map((id) => (
              <span
                key={id}
                className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
              >
                {valueLabels[id] ?? id}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.interest_tags.map((id) => (
              <span
                key={id}
                className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {interestLabels[id] ?? id}
              </span>
            ))}
          </div>
          {data.mbti_type && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className="inline-flex items-center rounded-md bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                {data.mbti_type}
              </span>
              <span className="text-xs text-muted-foreground">人格类型</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
