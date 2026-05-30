import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface ProfileWithDataProps {
  params: Promise<{ username: string }>;
}

export async function ProfileWithData({ params }: ProfileWithDataProps) {
  const { username } = await params;
  const param = decodeURIComponent(username);
  const supabase = await createClient();

  const isUuid = UUID_REGEX.test(param);
  const query = isUuid
    ? supabase.from("profiles").select("id, username, layer0, layer1, visibility_settings").eq("id", param)
    : supabase.from("profiles").select("id, username, layer0, layer1, visibility_settings").eq("username", param);

  const { data: profile, error } = await query.single();

  if (error || !profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProfilePage
      profile={profile}
      currentUserId={user?.id ?? null}
    />
  );
}
