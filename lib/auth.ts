import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export type DashboardRole = "owner" | "admin";

export type DashboardProfile = {
  id: string;
  email: string | null;
  role: DashboardRole;
};

export async function requireDashboardAccess() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user.id)
      .maybeSingle();

  if (
    profileError ||
    !profile ||
    !["owner", "admin"].includes(
      profile.role
    )
  ) {
    await supabase.auth.signOut();
    redirect("/login?error=dashboard_access_denied");
  }

  return {
    user,
    profile: profile as DashboardProfile,
  };
}

