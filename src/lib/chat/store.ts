import "server-only";

import { generateId, type UIMessage } from "ai";

import {
  createChatTitle,
  getMessageText,
  getTurnIndex,
} from "@/lib/chat/messages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ChatMessageInput } from "@/schemas/chat";

export type ChatHistoryItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export async function deleteChatSession(input: {
  chatId: string;
  userId: string;
}): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("chat_sessions")
    .delete()
    .eq("id", input.chatId)
    .eq("user_id", input.userId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(`chat session delete failed: ${error.message}`);
  return Boolean(data);
}

export async function assertChatOwnership(
  chatId: string,
  userId: string,
): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("chat_sessions")
    .select("user_id")
    .eq("id", chatId)
    .maybeSingle();

  if (error) throw new Error(`chat ownership lookup failed: ${error.message}`);
  if (data && data.user_id !== userId) {
    throw new Error("CHAT_FORBIDDEN");
  }
}

export async function replaceChatMessages(input: {
  chatId: string;
  userId: string;
  messages: UIMessage[];
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  const messages = input.messages as ChatMessageInput[];
  const title = createChatTitle(messages);

  await assertChatOwnership(input.chatId, input.userId);

  const { error: sessionError } = await admin.from("chat_sessions").upsert(
    {
      id: input.chatId,
      user_id: input.userId,
      title,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (sessionError) throw new Error(`chat session upsert failed: ${sessionError.message}`);

  if (messages.length === 0) return;

  const rows = messages.map((message, index) => ({
    content: getMessageText(message),
    id: message.id || generateId(),
    session_id: input.chatId,
    user_id: input.userId,
    role: message.role,
    parts: [{ type: "text", text: getMessageText(message) }],
    turn_index: getTurnIndex(messages, index),
  }));
  const { error: upsertError } = await admin.from("chat_messages").upsert(rows, {
    onConflict: "session_id,id",
  });

  if (upsertError) throw new Error(`chat message upsert failed: ${upsertError.message}`);

  const currentIds = rows.map((row) => row.id);
  const { data: existing, error: existingError } = await admin
    .from("chat_messages")
    .select("id")
    .eq("session_id", input.chatId);

  if (existingError) throw new Error(`chat message lookup failed: ${existingError.message}`);

  const staleIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !currentIds.includes(id));

  if (staleIds.length === 0) return;

  const { error: deleteError } = await admin
    .from("chat_messages")
    .delete()
    .eq("session_id", input.chatId)
    .in("id", staleIds);

  if (deleteError) throw new Error(`stale chat message delete failed: ${deleteError.message}`);
}
