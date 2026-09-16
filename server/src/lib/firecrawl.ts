import { Firecrawl } from "firecrawl";
import { env } from "../common/config/env.js";
import { ValidationError } from "../common/utils/app-error.js";

export async function scrapeWebsite(url: string) {
  const apiKey = env.FIRECRAWL_API_KEY;

  if (apiKey) {
    try {
      const client = new Firecrawl({ apiKey });
      const result = await client.scrape(url, {
        formats: ["markdown"],
      });

      const markdown = result.markdown?.trim();
      if (markdown) {
        return {
          markdown,
          title: result.metadata?.title || url,
          sourceUrl: result.metadata?.sourceURL ?? url,
        };
      }
    } catch {
      // Fall through to native fetch fallback
    }
  }

  // Fallback: Fetch directly and extract readable text
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new ValidationError(`Failed to fetch website (${response.status})`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    // Clean HTML scripts, styles, and extract text
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      throw new ValidationError("Could not extract text content from this website");
    }

    return {
      markdown: cleanText,
      title,
      sourceUrl: url,
    };
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError("Could not fetch or parse website content");
  }
}
