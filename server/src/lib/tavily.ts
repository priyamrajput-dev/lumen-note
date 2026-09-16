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

async function searchWebFallback(query: string): Promise<TavilySearchResponse> {
  try {
    const res = await fetch("https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const results: TavilySearchResult[] = [];

    const blocks = html.split("<div class=\"result ");
    for (let i = 1; i < blocks.length && results.length < 5; i++) {
      const block = blocks[i];
      const titleMatch = block.match(
        /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/,
      );
      const snippetMatch = block.match(
        /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/,
      );

      if (titleMatch && snippetMatch) {
        let rawUrl = titleMatch[1];
        if (rawUrl.includes("uddg=")) {
          const matchUddg = rawUrl.match(/uddg=([^&]+)/);
          if (matchUddg) rawUrl = decodeURIComponent(matchUddg[1]);
        }
        const title = titleMatch[2]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .trim();
        const content = snippetMatch[1]
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .trim();

        if (title && content) {
          results.push({ title, url: rawUrl, content, score: 0.9 });
        }
      }
    }

    return { query, results };
  } catch (err) {
    console.warn("Native web search fallback failed:", err);
    return { query, results: [] };
  }
}

export async function searchWeb(query: string): Promise<TavilySearchResponse> {
  const apiKey = env.TAVILY_API_KEY?.trim();

  if (apiKey) {
    try {
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
    } catch (err) {
      console.warn("Tavily search failed, using native fallback:", err);
    }
  }

  return searchWebFallback(query);
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
