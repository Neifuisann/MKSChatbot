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

export const chatSessionIdSchema = z.uuid();

export const chatHistoryQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const chatSessionUpdateSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("rename"),
    id: chatSessionIdSchema,
    title: z.string().trim().min(1).max(160),
  }),
  z.object({
    action: z.literal("star"),
    id: chatSessionIdSchema,
    isStarred: z.boolean(),
  }),
]);

export const chatShareSchema = z.object({
  id: chatSessionIdSchema,
});

export const chatShareTokenSchema = z.uuid();

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
