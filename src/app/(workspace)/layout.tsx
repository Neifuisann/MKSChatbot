import { redirect } from "next/navigation";

import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const CHAT_HISTORY_PAGE_SIZE = 12;

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: chatHistory }] = await Promise.all([
    supabase.from("profiles").select("student_id, full_name").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("chat_sessions")
      .select("id, title, custom_title, is_starred")
      .order("is_starred", { ascending: false })
      .order("updated_at", { ascending: false })
      .order("id")
      .limit(CHAT_HISTORY_PAGE_SIZE + 1),
  ]);

  const metadataName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : undefined;
  const avatarUrl =
    typeof user.user_metadata.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata.picture === "string"
        ? user.user_metadata.picture
        : undefined;

  return (
    <main className="flex h-dvh overflow-hidden bg-[#f7f5ef] text-[#2b332e]">
      <WorkspaceSidebar
        chatHistory={(chatHistory ?? []).slice(0, CHAT_HISTORY_PAGE_SIZE).map((chat) => ({
          id: chat.id,
          isStarred: chat.is_starred,
          title: chat.custom_title || chat.title,
        }))}
        chatHistoryHasMore={(chatHistory?.length ?? 0) > CHAT_HISTORY_PAGE_SIZE}
        user={{
          avatarUrl,
          email: user.email,
          isAdmin: user.app_metadata.role === "admin",
          name: profile?.full_name || metadataName || user.email || "MKS Student",
          studentId: profile?.student_id,
        }}
      />
      {children}
    </main>
  );
}
