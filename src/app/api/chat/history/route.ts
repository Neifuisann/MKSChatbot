import { NextResponse } from "next/server";

import { deleteChatSession } from "@/lib/chat/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chatHistoryQuerySchema, chatSessionIdSchema } from "@/schemas/chat";

const CHAT_HISTORY_PAGE_SIZE = 12;

export async function GET(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = chatHistoryQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid history request" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title")
    .order("updated_at", { ascending: false })
    .order("id")
    .range(parsed.data.offset, parsed.data.offset + CHAT_HISTORY_PAGE_SIZE);

  if (error) {
    console.error("Failed to load chat history", error);
    return NextResponse.json({ error: "Unable to load chat history" }, { status: 500 });
  }

  return NextResponse.json({
    hasMore: (data?.length ?? 0) > CHAT_HISTORY_PAGE_SIZE,
    items: (data ?? []).slice(0, CHAT_HISTORY_PAGE_SIZE),
  });
}

export async function DELETE(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedId = chatSessionIdSchema.safeParse(
    new URL(request.url).searchParams.get("id"),
  );
  if (!parsedId.success) {
    return NextResponse.json({ error: "Invalid chat id" }, { status: 400 });
  }

  let deleted: boolean;
  try {
    deleted = await deleteChatSession({
      chatId: parsedId.data,
      userId: user.id,
    });
  } catch (error) {
    console.error("Failed to delete chat session", error);
    return NextResponse.json({ error: "Unable to delete chat" }, { status: 500 });
  }

  if (!deleted) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
