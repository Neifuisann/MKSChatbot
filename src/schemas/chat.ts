import { z } from "zod";

const messagePartSchema = z
  .object({
    type: z.string().min(1).max(80),
  })
  .loose();

export const chatMessageSchema = z.object({
  id: z.string().min(1).max(10_000),
  role: z.enum(["user", "assistant"]),
  parts: z.array(messagePartSchema).min(1).max(100),
});

export const chatRequestSchema = z.object({
  id: z.uuid(),
  messages: z.array(chatMessageSchema).min(1).max(100),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
