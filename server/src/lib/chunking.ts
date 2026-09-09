export type TextChunk = {
  index: number;
  content: string;
  metadata?: Record<string, unknown>;
};

/** Default maximum characters per chunk when no option is passed. */
const DEFAULT_CHUNK_SIZE = 1000;

/** Default overlap between consecutive chunks. */
const DEFAULT_CHUNK_OVERLAP = 100;

/** Separators tried in order from natural paragraphs to character slicing. */
const SEPARATORS = ["\n\n", "\n", ". ", " ", ""];

function mergeSplits(splits: string[], separator: string, chunkSize: number) {
  const docs: string[] = [];
  let current: string[] = [];
  let total = 0;

  for (const split of splits) {
    const len = split.length;
    const sepLen = current.length > 0 ? separator.length : 0;

    if (total + len + sepLen > chunkSize && current.length > 0) {
      docs.push(current.join(separator));
      total = 0;
      current = [];
    }

    current.push(split);
    total += len + sepLen;
  }

  if (current.length > 0) {
    docs.push(current.join(separator));
  }

  return docs;
}

function splitText(text: string, chunkSize: number, chunkOverlap: number) {
  const chunks: string[] = [];

  for (const separator of SEPARATORS) {
    if (separator) {
      const splits = text.split(separator).filter(Boolean);
      if (splits.length === 1) {
        continue;
      }
      chunks.push(...mergeSplits(splits, separator, chunkSize));
    } else {
      for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
        chunks.push(text.slice(i, i + chunkSize));
      }
    }

    if (chunks.length > 0) {
      break;
    }
  }

  return chunks.filter((chunk) => chunk.trim().length > 0);
}

export function chunkText(
  text: string,
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
    metadata?: Record<string, unknown>;
  } = {},
): TextChunk[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;
  const parts = splitText(text.trim(), chunkSize, chunkOverlap);

  return parts.map((content, index) => ({
    index,
    content,
    metadata: options.metadata,
  }));
}

export function chunkPages(
  pages: string[],
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
  } = {},
): TextChunk[] {
  const chunks: TextChunk[] = [];
  let index = 0;

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex].trim();
    if (!pageText) {
      continue;
    }

    const pageChunks = chunkText(pageText, {
      ...options,
      metadata: { page: pageIndex + 1 },
    });

    for (const chunk of pageChunks) {
      chunks.push({
        index,
        content: chunk.content,
        metadata: chunk.metadata,
      });
      index += 1;
    }
  }

  return chunks;
}
