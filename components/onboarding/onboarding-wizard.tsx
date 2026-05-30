"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAYER0_STORAGE_KEY } from "@/lib/types/layer0";
import type { Layer0FormData } from "@/lib/types/layer0";
import { Step1BasicInfo } from "./step1-basic-info";
import { Step2Manifesto } from "./step2-manifesto";
import { Step3ValueTags } from "./step3-value-tags";
import { Step4InterestTags } from "./step4-interest-tags";
import { Step5Preview } from "./step5-preview";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  { id: 1, title: "基础信息", desc: "姓名与头像" },
  { id: 2, title: "个人宣言", desc: "20-50字核心理念" },
  { id: 3, title: "价值观", desc: "选择3-5个" },
  { id: 4, title: "兴趣", desc: "选择3-5个" },
  { id: 5, title: "预览", desc: "确认你的名片" },
];

interface OnboardingWizardProps {
  userId: string;
  initialData: Partial<Layer0FormData>;
}

export function OnboardingWizard({ userId, initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Layer0FormData>({
    name: initialData.name ?? "",
    avatar: initialData.avatar ?? "",
    manifesto: initialData.manifesto ?? "",
    value_tags: initialData.value_tags ?? [],
    interest_tags: initialData.interest_tags ?? [],
    city: initialData.city ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LAYER0_STORAGE_KEY, JSON.stringify(data));
    }
  };

  const updateData = (updates: Partial<Layer0FormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.name.trim().length >= 1;
      case 2:
        return data.manifesto.length >= 20 && data.manifesto.length <= 50;
      case 3:
        return data.value_tags.length >= 3 && data.value_tags.length <= 5;
      case 4:
        return data.interest_tags.length >= 3 && data.interest_tags.length <= 5;
      default:
        return true;
    }
  };

  const handleNext = () => {
    saveDraft();
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/layer0", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          avatar: data.avatar || undefined,
          manifesto: data.manifesto.trim(),
          value_tags: data.value_tags,
          interest_tags: data.interest_tags,
          city: data.city.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.details?.formErrors?.[0] ?? json.error ?? "保存失败";
        throw new Error(msg);
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem(LAYER0_STORAGE_KEY);
      }
      router.replace("/protected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 进度 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`shrink-0 flex flex-col items-center gap-1 ${
              step === s.id ? "opacity-100" : "opacity-50"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s.id}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {s.title}
            </span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1].title}</CardTitle>
          <CardDescription>{STEPS[step - 1].desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <Step1BasicInfo data={data} onChange={updateData} />
          )}
          {step === 2 && (
            <Step2Manifesto data={data} onChange={updateData} />
          )}
          {step === 3 && (
            <Step3ValueTags data={data} onChange={updateData} />
          )}
          {step === 4 && (
            <Step4InterestTags data={data} onChange={updateData} />
          )}
          {step === 5 && (
            <Step5Preview data={data} />
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一步
            </Button>
            {step < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                下一步
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? "保存中..." : "完成"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
