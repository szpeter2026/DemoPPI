"use client";

import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Layer0FormData } from "@/lib/types/layer0";
import { User, Upload } from "lucide-react";

interface Step1BasicInfoProps {
  data: Layer0FormData;
  onChange: (updates: Partial<Layer0FormData>) => void;
}

export function Step1BasicInfo({ data, onChange }: Step1BasicInfoProps) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Avatar upload error:", error);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    onChange({ avatar: publicUrl });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => ref.current?.click()}
        >
          {data.avatar ? (
            <img
              src={data.avatar}
              alt="头像"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-muted-foreground" />
          )}
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => ref.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          上传头像
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">姓名或昵称 *</Label>
        <Input
          id="name"
          placeholder="输入你的显示名称"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">所在城市（选填）</Label>
        <Input
          id="city"
          placeholder="如：深圳"
          value={data.city}
          onChange={(e) => onChange({ city: e.target.value })}
          maxLength={50}
        />
      </div>
    </div>
  );
}
