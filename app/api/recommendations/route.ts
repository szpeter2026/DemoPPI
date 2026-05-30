import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { recommendConnections } from "@/lib/consensus/recommend";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);

  if (limit < 1) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  const recommendations = await recommendConnections(user.id, limit);
  return NextResponse.json(recommendations);
}
