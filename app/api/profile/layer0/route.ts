import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const Layer0Schema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.string().url().optional().or(z.literal("")),
  manifesto: z.string().min(20).max(50),
  value_tags: z.array(z.string()).min(3).max(5),
  interest_tags: z.array(z.string()).min(3).max(5),
  city: z.string().max(50).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = Layer0Schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const layer0 = {
    ...parsed.data,
    avatar: parsed.data.avatar || undefined,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      layer0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
