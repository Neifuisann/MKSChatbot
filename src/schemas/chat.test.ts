import { describe, expect, it } from "vitest";

import { chatShareSchema, chatSessionUpdateSchema } from "@/schemas/chat";

const chatId = "017f22e2-79b0-4d44-b2ae-ff8f6c8c31cd";

describe("chatSessionUpdateSchema", () => {
  it("accepts valid star and rename updates", () => {
    expect(
      chatSessionUpdateSchema.safeParse({
        action: "star",
        id: chatId,
        isStarred: true,
      }).success,
    ).toBe(true);
    expect(
      chatSessionUpdateSchema.safeParse({
        action: "rename",
        id: chatId,
        title: "Lịch học tuần tới",
      }).success,
    ).toBe(true);
  });

  it("rejects empty rename titles and invalid ids", () => {
    expect(
      chatSessionUpdateSchema.safeParse({
        action: "rename",
        id: chatId,
        title: "   ",
      }).success,
    ).toBe(false);
    expect(
      chatSessionUpdateSchema.safeParse({
        action: "star",
        id: "not-a-uuid",
        isStarred: true,
      }).success,
    ).toBe(false);
  });
});

describe("chatShareSchema", () => {
  it("accepts only a valid chat id", () => {
    expect(chatShareSchema.safeParse({ id: chatId }).success).toBe(true);
    expect(chatShareSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
  });
});
