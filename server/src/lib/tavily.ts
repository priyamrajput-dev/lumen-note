import { tavily } from "@tavily/core";
import { env } from "../common/config/env.js";

export type TavilySearchResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type TavilySearchResponse = {
  query: string;
  answer?: string;
  results: TavilySearchResult[];
};

let client: ReturnType<typeof tavily> | null = null;

export async function searchWeb(query: string): Promise<TavilySearchResponse> {
  const apiKey = env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  if (!client) {
    client = tavily({ apiKey });
  }

  const response = await client.search(query, {
    searchDepth: "basic",
    maxResults: 5,
    includeAnswer: true,
  });

  return {
    query,
    answer:
      typeof response.answer === "string" ? response.answer : undefined,
    results: (response.results ?? []).map((result) => ({
      title: result.title ?? result.url ?? "Untitled",
      url: result.url ?? "",
      content: result.content ?? "",
      score: result.score,
    })),
  };
}

export function formatTavilyResultsForPrompt(
  response: TavilySearchResponse,
): string {
  if (response.results.length === 0) {
    return "No web results were found.";
  }

  const blocks = response.results.map(
    (result, index) =>
      `[W${index + 1}] ${result.title} (${result.url})\n${result.content}`,
  );

  const parts = ["Web search results:"];

  if (response.answer) {
    parts.push(`Summary: ${response.answer}`);
  }

  parts.push(blocks.join("\n\n"));

  return parts.join("\n\n");
}
