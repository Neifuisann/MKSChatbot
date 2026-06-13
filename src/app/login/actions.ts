"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getRequestOrigin } from "@/lib/http/origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const requestHeaders = await headers();
  const origin = getRequestOrigin(requestHeaders);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=/chat`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}
