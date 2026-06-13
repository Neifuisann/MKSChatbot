import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

type AiProvider = "anthropic" | "google" | "openai";

export function getChatModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER ?? "openai") as AiProvider;
  const model = process.env.AI_CHAT_MODEL ?? "gpt-4.1-mini";

  switch (provider) {
    case "anthropic":
      return anthropic(model);
    case "google":
      return google(model);
    case "openai":
      return openai(model);
    default:
      throw new Error(`Unsupported AI provider: ${provider satisfies never}`);
  }
}

export function getEmbeddingModel(): ReturnType<typeof openai.embedding> {
  return openai.embedding(
    process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  );
}
