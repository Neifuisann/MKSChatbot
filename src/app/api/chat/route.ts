import {
  convertToModelMessages,
  generateId,
  streamText,
  type UIMessage,
} from "ai";
import { NextResponse } from "next/server";

import { getChatModel } from "@/lib/ai/models";
import { schoolAssistantSystemPrompt } from "@/lib/ai/prompts";
import { assertChatOwnership, replaceChatMessages } from "@/lib/chat/store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { chatRequestSchema } from "@/schemas/chat";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = chatRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
  }

  try {
    await assertChatOwnership(parsed.data.id, user.id);
  } catch (error) {
    if (error instanceof Error && error.message === "CHAT_FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    throw error;
  }

  const messages = parsed.data.messages as UIMessage[];
  const result = streamText({
    model: getChatModel(),
    system: schoolAssistantSystemPrompt,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    generateMessageId: generateId,
    originalMessages: messages,
    onFinish: async ({ messages: completedMessages }) => {
      try {
        await replaceChatMessages({
          chatId: parsed.data.id,
          userId: user.id,
          messages: completedMessages,
        });
      } catch (error) {
        console.error("Failed to persist completed chat stream", error);
      }
    },
  });
}
