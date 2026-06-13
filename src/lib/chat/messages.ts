import type { UIMessage } from "ai";

import type { ChatMessageInput } from "@/schemas/chat";

export function getMessageText(
  message: Pick<UIMessage, "parts"> | ChatMessageInput,
): string {
  return message.parts.reduce((text, part) => {
    if (
      part.type === "text" &&
      "text" in part &&
      typeof part.text === "string"
    ) {
      return text + part.text;
    }

    return text;
  }, "");
}

export function getTurnIndex(messages: ChatMessageInput[], index: number): number {
  let turnIndex = -1;

  for (let current = 0; current <= index; current += 1) {
    if (messages[current]?.role === "user") {
      turnIndex += 1;
    }
  }

  return Math.max(turnIndex, 0);
}

export function createChatTitle(messages: ChatMessageInput[]): string {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text = firstUserMessage ? getMessageText(firstUserMessage).trim() : "";

  if (!text) return "Cuộc trò chuyện mới";
  return text.length > 72 ? `${text.slice(0, 69).trimEnd()}...` : text;
}
