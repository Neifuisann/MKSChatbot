import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

type AiProvider = "anthropic" | "google" | "openai" | "openrouter";

export function getChatModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER ?? "openrouter") as AiProvider;
  const model =
    process.env.AI_CHAT_MODEL ?? "deepseek/deepseek-v4-flash";

  switch (provider) {
    case "anthropic":
      return anthropic(model);
    case "google":
      return google(model);
    case "openai":
      return openai(model);
    case "openrouter":
      return createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
          "X-OpenRouter-Title": "MKS School Assistant",
        },
      })(model);
    default:
      throw new Error(`Unsupported AI provider: ${provider satisfies never}`);
  }
}

export function getEmbeddingModel(): ReturnType<typeof openai.embedding> {
  return openai.embedding(
    process.env.AI_EMBEDDING_MODEL ?? "text-embedding-3-small",
  );
}
