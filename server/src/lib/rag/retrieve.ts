import { RAG_MIN_SCORE, RAG_TOP_K } from "../ai-config.js";
import { embedTexts } from "../openai.js";
import { queryWorkspaceVectors } from "../pinecone.js";
import { env } from "../../common/config/env.js";
import SourceRepository from "../../modules/source/source.repository.js";
import { sourceChunkRepository } from "../../modules/source/source-chunk.repository.js";

const sourceRepo = new SourceRepository();

export type RetrievedChunk = {
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  chunkId: string;
  chunkIndex: number;
  page?: number;
  text: string;
  score: number;
};

const STOP_WORDS = new Set([
  "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "by", "from",
  "and", "or", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "what", "which", "who", "whom", "this", "that",
  "these", "those", "am", "it", "its", "as", "acc", "according", "person", "used",
  "mention", "mentioned", "tell", "show", "give", "can", "you", "me", "i", "about"
]);

function computeSmartRelevance(
  query: string,
  queryTerms: string[],
  sourceTitle: string,
  chunkText: string
): number {
  let score = 0;
  const lowerTitle = sourceTitle.toLowerCase();
  const lowerText = chunkText.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();

  // 1. Exact phrase match
  if (lowerQuery.length > 3 && lowerText.includes(lowerQuery)) {
    score += 5.0;
  }

  // 2. Title match boost
  for (const term of queryTerms) {
    if (lowerTitle.includes(term)) {
      score += 3.5;
    }
  }

  // 3. Keyword frequency in chunk text
  let matchedTerms = 0;
  for (const term of queryTerms) {
    const regex = new RegExp(`\\b${term}`, "gi");
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      matchedTerms += 1;
      score += Math.min(matches.length * 0.9, 3.0);
    }
  }

  if (queryTerms.length > 0 && matchedTerms > 0) {
    score += (matchedTerms / queryTerms.length) * 2.5;
  }

  return score;
}

export async function retrieveWorkspaceContext(
  workspaceId: string,
  query: string,
): Promise<RetrievedChunk[]> {
  const chunks: RetrievedChunk[] = [];

  // 1. Try vector retrieval if Pinecone is configured
  if (env.PINECONE_API_KEY) {
    try {
      const [embedding] = await embedTexts([query]);
      if (embedding) {
        const matches = await queryWorkspaceVectors(
          workspaceId,
          embedding,
          RAG_TOP_K,
        );

        for (const match of matches) {
          const score = match.score ?? 0;
          if (score < RAG_MIN_SCORE) {
            continue;
          }

          const metadata = match.metadata as
            | Record<string, unknown>
            | undefined;
          if (
            !metadata ||
            typeof metadata.sourceId !== "string" ||
            typeof metadata.sourceTitle !== "string" ||
            typeof metadata.sourceType !== "string" ||
            typeof metadata.chunkId !== "string" ||
            typeof metadata.text !== "string"
          ) {
            continue;
          }

          chunks.push({
            sourceId: metadata.sourceId,
            sourceTitle: metadata.sourceTitle,
            sourceType: metadata.sourceType,
            chunkId: metadata.chunkId,
            chunkIndex: Number(metadata.chunkIndex ?? 0),
            ...(typeof metadata.page === "number" ? { page: metadata.page } : {}),
            text: metadata.text,
            score,
          });
        }
      }
    } catch (err) {
      console.warn("Vector search failed, using smart database context fallback:", err);
    }
  }

  // If vector search returned valid chunks, return them
  if (chunks.length > 0) {
    return chunks;
  }

  // 2. Intelligent Database Fallback with Keyword & Title Relevance Ranking
  try {
    const sources = await sourceRepo.findSourcesByWorkspaceId(workspaceId, {
      status: "READY",
    });

    if (sources.length === 0) {
      return [];
    }

    const queryTerms = query
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

    const scoredChunks: RetrievedChunk[] = [];

    for (const s of sources) {
      const dbChunks = await sourceChunkRepository.findChunksBySourceId(s.id);
      if (dbChunks.length > 0) {
        for (const chunk of dbChunks) {
          const chunkMetadata = chunk.metadata as Record<string, unknown> | null;
          const page =
            typeof chunkMetadata?.page === "number"
              ? chunkMetadata.page
              : undefined;

          const rawScore = computeSmartRelevance(
            query,
            queryTerms,
            s.title,
            chunk.content,
          );

          // Normalize score to 0.0 - 0.99
          const normalizedScore =
            rawScore > 0 ? Math.min(0.55 + rawScore * 0.08, 0.98) : 0.0;

          scoredChunks.push({
            sourceId: s.id,
            sourceTitle: s.title,
            sourceType: s.type,
            chunkId: chunk.id,
            chunkIndex: chunk.index,
            ...(page ? { page } : {}),
            text: chunk.content,
            score: Number(normalizedScore.toFixed(2)),
          });
        }
      } else if (s.content?.trim()) {
        const rawScore = computeSmartRelevance(
          query,
          queryTerms,
          s.title,
          s.content,
        );
        const normalizedScore =
          rawScore > 0 ? Math.min(0.55 + rawScore * 0.08, 0.98) : 0.0;

        scoredChunks.push({
          sourceId: s.id,
          sourceTitle: s.title,
          sourceType: s.type,
          chunkId: `src-${s.id}`,
          chunkIndex: 0,
          text: s.content.slice(0, 2000),
          score: Number(normalizedScore.toFixed(2)),
        });
      }
    }

    // Filter relevant chunks: if any chunk scored > 0, strictly exclude 0-relevance chunks
    const relevantChunks = scoredChunks.filter((c) => c.score > 0);
    const candidates = relevantChunks.length > 0 ? relevantChunks : scoredChunks;

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, RAG_TOP_K);
  } catch (err) {
    console.error("Database fallback retrieval failed:", err);
    return [];
  }
}

export type UserMemoryContext = string;

export function buildChatSystemPrompt(input: {
  chunks: RetrievedChunk[];
  conversationSummary?: string | null;
  userMemories?: UserMemoryContext[];
  webSearchEnabled?: boolean;
}) {
  const sections: string[] = [
    "You are Lumen Note, an intelligent, professional workspace AI research assistant.",
    "Your mission is to synthesize, explain, and answer questions thoroughly based on the user's workspace documents, notes, transcripts, and materials.",
  ];

  if (input.webSearchEnabled) {
    sections.push(
      "You have access to a web_search tool for up-to-date information outside the workspace.",
      "Use it when the user asks about recent events or topics not covered by their sources.",
      "Cite web results inline using [W1], [W2], etc. matching the web result blocks.",
    );
  }

  if (input.userMemories?.length) {
    const memoryBlock = input.userMemories
      .map((memory) => `- ${memory}`)
      .join("\n");

    sections.push(
      "Known facts and preferences about this user:",
      memoryBlock,
    );
  }

  const summary = input.conversationSummary?.trim();
  if (summary) {
    sections.push("Earlier conversation summary:", summary);
  }

  if (input.chunks.length === 0) {
    sections.push(
      "This workspace has no matching source content for this query.",
      input.webSearchEnabled
        ? "Use web search when needed, or answer helpfully from general knowledge."
        : "Answer helpfully from general knowledge and suggest adding or checking relevant workspace sources.",
      "Do not invent false citations.",
    );
    return sections.join("\n");
  }

  const context = input.chunks
    .map((chunk, index) => {
      const label = `[${index + 1}] ${chunk.sourceTitle} (${chunk.sourceType})${
        chunk.page ? `, page ${chunk.page}` : ""
      }`;
      return `${label}\n${chunk.text}`;
    })
    .join("\n\n");

  sections.push(
    "Grounding Instructions:",
    "- Use the retrieved context below to answer accurately and comprehensively.",
    "- When asked about resumes, credentials, technologies, or specific details, extract and format all relevant information professionally (use structured markdown, bold highlights, and clear bullet points).",
    "- Cite exact source numbers inline using [1], [2], etc., matching the numbered context blocks below.",
    "- Be direct, educational, precise, and articulate.",
    "",
    "Retrieved Workspace Context:",
    context,
  );

  return sections.join("\n");
}
