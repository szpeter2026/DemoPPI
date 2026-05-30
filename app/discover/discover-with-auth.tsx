import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DiscoverPage } from "@/components/discover/discover-page";

export async function DiscoverPageWithAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <DiscoverPage userId={user.id} />;
}
