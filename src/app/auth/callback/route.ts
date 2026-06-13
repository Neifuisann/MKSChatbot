import { type NextRequest, NextResponse } from "next/server";

import { getRequestOrigin } from "@/lib/http/origin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/chat";
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextPath(request.nextUrl.searchParams.get("next"));
  const origin = getRequestOrigin(request.headers);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const response = NextResponse.redirect(new URL(next, origin));
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?error=oauth", origin));
}
