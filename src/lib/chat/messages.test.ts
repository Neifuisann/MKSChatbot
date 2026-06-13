import { describe, expect, it } from "vitest";

import {
  createChatTitle,
  getMessageText,
  getTurnIndex,
} from "@/lib/chat/messages";
import type { ChatMessageInput } from "@/schemas/chat";

const messages: ChatMessageInput[] = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "Lịch học hôm nay?" }] },
  { id: "a1", role: "assistant", parts: [{ type: "text", text: "Mình sẽ kiểm tra." }] },
  { id: "u2", role: "user", parts: [{ type: "text", text: "Cảm ơn" }] },
];

describe("chat message helpers", () => {
  it("pairs user and assistant messages into turns", () => {
    expect(messages.map((_, index) => getTurnIndex(messages, index))).toEqual([0, 0, 1]);
  });

  it("extracts text while ignoring other streamed parts", () => {
    expect(
      getMessageText({
        parts: [
          { type: "reasoning", text: "hidden" },
          { type: "text", text: "Visible" },
        ],
      } as never),
    ).toBe("Visible");
  });

  it("creates a useful history title from the first user message", () => {
    expect(createChatTitle(messages)).toBe("Lịch học hôm nay?");
  });

});
