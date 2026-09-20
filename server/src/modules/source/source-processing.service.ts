import type { PineconeRecord } from "@pinecone-database/pinecone";
import { chunkPages, chunkText } from "../../lib/chunking.js";
import { embedTexts } from "../../lib/openai.js";
import { extractPdfFromCloudinary } from "../../lib/pdf.js";
import { deleteFromCloudinary } from "../../lib/cloudinary.js";
import {
  deleteSourceVectors,
  type VectorMetadata,
  upsertSourceVectors,
} from "../../lib/pinecone.js";
import SourceRepository, {
  type SourceRecord,
} from "./source.repository.js";
import SourceChunkRepository, {
  type SourceChunkRecord,
} from "./source-chunk.repository.js";
import { env } from "../../common/config/env.js";

import { fetchYoutubeTranscript } from "../../lib/youtube.js";
import { scrapeWebsite } from "../../lib/firecrawl.js";

const sourceRepo = new SourceRepository();
const chunkRepo = new SourceChunkRepository();

type SourceMetadata = {
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  publicId?: string;
  resourceType?: "raw" | "image";
  importedFrom?: string;
  videoId?: string;
  channel?: string;
  hasCaptions?: boolean;
  processingError?: string;
  chunkCount?: number;
  pageCount?: number;
  indexedAt?: string;
};

async function extractSourceText(source: SourceRecord) {
  const text = source.content?.trim();
  if (text) {
    return {
      text,
      pageCount: undefined,
      pages: undefined,
    };
  }

  if (source.type === "PDF") {
    const metadata =
      source.metadata &&
      typeof source.metadata === "object" &&
      !Array.isArray(source.metadata)
        ? (source.metadata as SourceMetadata)
        : {};

    if (!metadata.fileUrl) {
      throw new Error("PDF source is missing fileUrl metadata");
    }

    const extracted = await extractPdfFromCloudinary({
      fileUrl: metadata.fileUrl,
      publicId: metadata.publicId,
      resourceType: metadata.resourceType ?? "image",
    });

    return {
      text: extracted.text,
      pageCount: extracted.pageCount,
      pages: extracted.pages,
    };
  }

  if (source.type === "YOUTUBE") {
    if (source.content && source.content.trim().length > 0) {
      return {
        text: source.content,
        pageCount: undefined,
        pages: undefined,
      };
    }
    if (source.url) {
      const extracted = await fetchYoutubeTranscript(source.url);
      return {
        text: extracted.content,
        pageCount: undefined,
        pages: undefined,
      };
    }
  }

  if (source.type === "WEBSITE" && source.url) {
    const scraped = await scrapeWebsite(source.url);
    return {
      text: scraped.markdown,
      pageCount: undefined,
      pages: undefined,
    };
  }

  throw new Error(`Source ${source.id} has no extractable content`);
}

export function markSourceProcessing(sourceId: string) {
  return sourceRepo.updateSourceRecord(sourceId, { status: "PROCESSING" });
}

export async function markSourceFailed(
  sourceId: string,
  error: unknown,
  existingMetadata: SourceRecord["metadata"],
) {
  const message =
    error instanceof Error ? error.message : "Source processing failed";

  const metadata =
    existingMetadata &&
    typeof existingMetadata === "object" &&
    !Array.isArray(existingMetadata)
      ? (existingMetadata as SourceMetadata)
      : {};

  return sourceRepo.updateSourceRecord(sourceId, {
    status: "FAILED",
    metadata: {
      ...metadata,
      processingError: message,
    },
  });
}

export async function extractSourceContent(sourceId: string) {
  const source = await sourceRepo.findSourceById(sourceId);
  if (!source) {
    throw new Error("Source not found");
  }

  const extracted = await extractSourceText(source);
  const metadata =
    source.metadata &&
    typeof source.metadata === "object" &&
    !Array.isArray(source.metadata)
      ? (source.metadata as SourceMetadata)
      : {};

  await sourceRepo.updateSourceRecord(sourceId, {
    content: extracted.text,
    metadata: {
      ...metadata,
      pageCount: extracted.pageCount ?? metadata.pageCount,
    },
  });

  return {
    sourceId,
    workspaceId: source.workspaceId,
    text: extracted.text,
    pages: extracted.pages,
    source,
  };
}

export async function chunkSourceContent(
  sourceId: string,
  text: string,
  pages?: string[],
) {
  await chunkRepo.deleteChunksBySourceId(sourceId);

  const chunks = pages?.length ? chunkPages(pages) : chunkText(text);

  if (chunks.length === 0) {
    throw new Error("No chunks were generated from source content");
  }

  return chunkRepo.createSourceChunks(
    chunks.map((chunk) => ({
      sourceId,
      index: chunk.index,
      content: chunk.content,
      tokenCount: Math.ceil(chunk.content.length / 4),
      metadata: chunk.metadata,
    })),
  );
}

export async function removeSourceFromIndex(
  workspaceId: string,
  sourceId: string,
) {
  const chunks = await chunkRepo.findChunksBySourceId(sourceId);
  const chunkIds = chunks.map((c) => c.id);

  if (env.PINECONE_API_KEY && chunkIds.length > 0) {
    try {
      await deleteSourceVectors(workspaceId, chunkIds);
    } catch (e) {
      console.warn("Failed to delete vectors from Pinecone:", e);
    }
  }

  try {
    const source = await sourceRepo.findSourceById(sourceId);
    const metadata = source?.metadata as Record<string, unknown> | undefined;
    if (metadata?.publicId && typeof metadata.publicId === "string") {
      await deleteFromCloudinary(
        metadata.publicId,
        (metadata.resourceType as "raw" | "image") ?? "raw",
      );
    }
  } catch (e) {
    console.warn("Failed to delete asset from Cloudinary:", e);
  }

  await chunkRepo.deleteChunksBySourceId(sourceId);
}

export async function listChunksForSource(sourceId: string) {
  const chunks = await chunkRepo.findChunksBySourceId(sourceId);
  return { chunks, count: chunks.length };
}

export async function embedAndIndexSource(
  source: SourceRecord,
  chunks: SourceChunkRecord[],
) {
  const batchSize = 50;
  const records: PineconeRecord<VectorMetadata>[] = [];

  if (env.OPENAI_API_KEY && env.PINECONE_API_KEY) {
    try {
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const embeddings = await embedTexts(batch.map((chunk) => chunk.content));

        for (let j = 0; j < batch.length; j += 1) {
          const chunk = batch[j]!;
          const embedding = embeddings[j]!;
          const chunkMetadata =
            chunk.metadata &&
            typeof chunk.metadata === "object" &&
            !Array.isArray(chunk.metadata)
              ? (chunk.metadata as Record<string, unknown>)
              : {};

          records.push({
            id: chunk.id,
            values: embedding,
            metadata: {
              workspaceId: source.workspaceId,
              sourceId: source.id,
              chunkId: chunk.id,
              chunkIndex: chunk.index,
              sourceTitle: source.title,
              sourceType: source.type,
              text: chunk.content.slice(0, 35000),
              ...(typeof chunkMetadata.page === "number"
                ? { page: chunkMetadata.page }
                : {}),
            },
          });
        }
      }

      await upsertSourceVectors(source.workspaceId, records);
    } catch (error) {
      console.warn("Vector embedding/upsert skipped or failed:", error);
    }
  }

  const metadata =
    source.metadata &&
    typeof source.metadata === "object" &&
    !Array.isArray(source.metadata)
      ? (source.metadata as SourceMetadata)
      : {};

  return sourceRepo.updateSourceRecord(source.id, {
    status: "READY",
    metadata: {
      ...metadata,
      chunkCount: chunks.length,
      indexedAt: new Date().toISOString(),
      processingError: undefined,
    },
  });
}
