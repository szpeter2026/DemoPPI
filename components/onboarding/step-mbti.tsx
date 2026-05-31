"use client";

import type { Layer0FormData } from "@/lib/types/layer0";

interface StepMbtiProps {
  data: Layer0FormData;
  onChange: (updates: Partial<Layer0FormData>) => void;
}

// MBTI 16种类型，按四组分类排列
const MBTI_GROUPS = [
  {
    label: "分析家（NT）",
    color: "purple",
    types: [
      { code: "INTJ", name: "策略家", desc: "富有想象力与战略眼光" },
      { code: "INTP", name: "逻辑学家", desc: "充满创造力的思想家" },
      { code: "ENTJ", name: "指挥官", desc: "大胆、富有想象力的领导者" },
      { code: "ENTP", name: "辩手", desc: "聪明好奇的思想探索者" },
    ],
  },
  {
    label: "外交家（NF）",
    color: "green",
    types: [
      { code: "INFJ", name: "提倡者", desc: "宁静而富有洞察力的理想主义者" },
      { code: "INFP", name: "调停者", desc: "诗意、善良的利他主义者" },
      { code: "ENFJ", name: "主人公", desc: "充满魅力、鼓舞人心的领导者" },
      { code: "ENFP", name: "竞选者", desc: "热情洋溢的自由灵魂" },
    ],
  },
  {
    label: "守卫者（SJ）",
    color: "blue",
    types: [
      { code: "ISTJ", name: "物流师", desc: "务实可靠、事实至上" },
      { code: "ISFJ", name: "守卫者", desc: "专注体贴的保护者" },
      { code: "ESTJ", name: "总经理", desc: "出色的管理者、事实的捍卫者" },
      { code: "ESFJ", name: "执政官", desc: "极受欢迎、善于关爱他人" },
    ],
  },
  {
    label: "探索家（SP）",
    color: "orange",
    types: [
      { code: "ISTP", name: "鉴赏家", desc: "大胆实用的实验者" },
      { code: "ISFP", name: "探险家", desc: "灵活迷人的艺术家" },
      { code: "ESTP", name: "企业家", desc: "精明能干、充满活力" },
      { code: "ESFP", name: "表演者", desc: "自发热情、充满活力" },
    ],
  },
];

const COLOR_MAP: Record<string, { ring: string; bg: string; text: string; badge: string }> = {
  purple: {
    ring: "ring-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  },
  green: {
    ring: "ring-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  blue: {
    ring: "ring-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  },
  orange: {
    ring: "ring-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
};

export function StepMbti({ data, onChange }: StepMbtiProps) {
  const selected = data.mbti_type;

  const handleSelect = (code: string) => {
    // 点同一个 = 取消选择
    onChange({ mbti_type: selected === code ? "" : code });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          选择你的 MBTI 人格类型，帮助找到更志同道合的伙伴。
          <span className="ml-1 text-primary font-medium">可跳过</span>，后续在设置里也能添加。
        </p>
      </div>

      <div className="space-y-5">
        {MBTI_GROUPS.map((group) => {
          const colors = COLOR_MAP[group.color];
          return (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}
                >
                  {group.label}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {group.types.map((t) => {
                  const isSelected = selected === t.code;
                  return (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => handleSelect(t.code)}
                      className={`
                        relative flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left
                        transition-all duration-150 hover:shadow-sm
                        ${isSelected
                          ? `ring-2 ${colors.ring} ${colors.bg} border-transparent`
                          : "border-border bg-card hover:bg-muted/50"
                        }
                      `}
                    >
                      <span
                        className={`text-sm font-bold tracking-wide ${
                          isSelected ? colors.text : "text-foreground"
                        }`}
                      >
                        {t.code}
                      </span>
                      <span className="text-xs font-medium text-foreground/80">{t.name}</span>
                      <span className="text-xs text-muted-foreground leading-tight line-clamp-2">
                        {t.desc}
                      </span>
                      {isSelected && (
                        <span
                          className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full ${colors.bg} ${colors.text} flex items-center justify-center text-[10px]`}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <p className="text-sm text-center text-muted-foreground">
          已选择：
          <span className="font-semibold text-foreground">{selected}</span>
          {" · "}
          {MBTI_GROUPS.flatMap((g) => g.types).find((t) => t.code === selected)?.name}
          <button
            type="button"
            onClick={() => onChange({ mbti_type: "" })}
            className="ml-2 text-xs text-muted-foreground underline hover:text-foreground"
          >
            清除
          </button>
        </p>
      )}
    </div>
  );
}
