"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ConsensusScore } from "./consensus-score";
import { ConsensusRadar } from "./consensus-radar";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";

interface ConsensusDetailProps {
  score: number;
  valueScore: number;
  interestScore: number;
  valueOverlap: string[];
  interestOverlap: string[];
  valueLabels?: Record<string, string>;
  interestLabels?: Record<string, string>;
  trigger?: React.ReactNode;
}

export function ConsensusDetail({
  score,
  valueScore,
  interestScore,
  valueOverlap,
  interestOverlap,
  valueLabels = {},
  interestLabels = {},
  trigger,
}: ConsensusDetailProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="查看共识详情"
          >
            <ConsensusScore score={score} size="sm" />
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">共识度</span>
            <ConsensusScore score={score} size="lg" />
          </div>
          <ConsensusRadar
            valueScore={valueScore}
            interestScore={interestScore}
            size={160}
          />
          {(valueOverlap.length > 0 || interestOverlap.length > 0) && (
            <div className="space-y-2">
              {valueOverlap.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    共同价值观
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {valueOverlap.map((id) => (
                      <Badge key={id} variant="secondary" className="text-xs">
                        {valueLabels[id] ?? id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {interestOverlap.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    共同兴趣
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {interestOverlap.map((id) => (
                      <Badge key={id} variant="outline" className="text-xs">
                        {interestLabels[id] ?? id}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
