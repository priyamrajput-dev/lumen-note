import OpenAI from "openai";
import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../common/config/env.js";
import { CHAT_MODEL, EMBEDDING_DIMENSIONS, EMBEDDING_MODEL } from "./ai-config.js";

let client: OpenAI | null = null;

export function getEffectiveApiKey(): string {
  const key =
    env.OPENROUTER_API_KEY?.trim() ||
    env.OPENAI_API_KEY?.trim() ||
    env.GEMINI_API_KEY?.trim();

  if (!key) {
    throw new Error("OPENAI_API_KEY or OPENROUTER_API_KEY is not configured");
  }

  return key;
}

export function isOpenRouterKey(key?: string): boolean {
  const targetKey = key || getEffectiveApiKey();
  return Boolean(env.OPENROUTER_API_KEY || targetKey.startsWith("sk-or-v1-"));
}

export function getOpenAIClient(): OpenAI {
  const apiKey = getEffectiveApiKey();

  if (!client) {
    const isRouter = isOpenRouterKey(apiKey);
    client = new OpenAI({
      apiKey,
      baseURL: isRouter ? "https://openrouter.ai/api/v1" : undefined,
    });
  }

  return client;
}

export function getAIModel(modelName: string = CHAT_MODEL) {
  const apiKey = getEffectiveApiKey();
  const isRouter = isOpenRouterKey(apiKey);

  const provider = createOpenAI({
    apiKey,
    baseURL: isRouter ? "https://openrouter.ai/api/v1" : undefined,
    name: isRouter ? "openrouter" : "openai",
  });

  const resolvedModel =
    isRouter && !modelName.includes("/")
      ? `openai/${modelName}`
      : modelName;

  return provider.chat(resolvedModel);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const openai = getOpenAIClient();

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data
    .sort((a, b) => a.index - b.index)
    .map((item) => item.embedding);
}

