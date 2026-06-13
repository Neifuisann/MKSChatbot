import type { UIMessage } from "ai";
import { notFound, redirect } from "next/navigation";

import { ChatWorkspace } from "@/components/chat-workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: session }, { data: storedMessages }] =
    await Promise.all([
      supabase.from("profiles").select("student_id, full_name").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("chat_sessions")
        .select("title, custom_title, is_starred, share_token")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("chat_messages").select("id, role, parts").eq("session_id", id).order("turn_index").order("created_at"),
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
    <ChatWorkspace
      chatId={id}
      initialMessages={(storedMessages ?? []) as UIMessage[]}
      initialIsStarred={session?.is_starred ?? false}
      initialShareToken={session?.share_token}
      title={session?.custom_title || session?.title || "MKS Assistant"}
      user={{
        avatarUrl,
        email: user.email,
        name: profile?.full_name || metadataName || user.email || "MKS Student",
        studentId: profile?.student_id,
      }}
    />
  );
}
