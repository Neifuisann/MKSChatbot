import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUser = {
  email?: string;
  id: string;
  name: string;
};

function metadataName(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Testing mode: every authenticated user can access admin management.

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    email: user.email,
    id: user.id,
    name:
      profile?.full_name ||
      metadataName(user.user_metadata.full_name) ||
      metadataName(user.user_metadata.name) ||
      user.email ||
      "MKS Admin",
  };
}
