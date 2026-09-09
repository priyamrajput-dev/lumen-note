import {
  Pinecone,
  type Index,
  type PineconeRecord,
} from "@pinecone-database/pinecone";
import { env } from "../common/config/env.js";
import { EMBEDDING_DIMENSIONS } from "./ai-config.js";

const indexName = env.PINECONE_INDEX ?? "lumennote";

let pineconeClient: Pinecone | null = null;
let indexReady = false;

function getPineconeClient(): Pinecone {
  if (!env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not configured");
  }

  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  }

  return pineconeClient;
}

async function waitForIndexReady(name: string) {
  const client = getPineconeClient();

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const description = await client.describeIndex(name);
    if (description.status?.ready) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Pinecone index "${name}" did not become ready in time`);
}

export async function ensurePineconeIndex() {
  if (indexReady) {
    return;
  }

  const client = getPineconeClient();
  const indexes = await client.listIndexes();
  const exists = indexes.indexes?.some((index) => index.name === indexName);

  if (!exists) {
    await client.createIndex({
      name: indexName,
      dimension: EMBEDDING_DIMENSIONS,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    await waitForIndexReady(indexName);
  }

  indexReady = true;
}

export async function getPineconeIndex(): Promise<Index> {
  await ensurePineconeIndex();
  return getPineconeClient().index(indexName);
}

export type VectorMetadata = {
  workspaceId: string;
  sourceId: string;
  chunkId: string;
  chunkIndex: number;
  sourceTitle: string;
  sourceType: string;
  text: string;
  page?: number;
};

export async function upsertSourceVectors(
  workspaceId: string,
  records: PineconeRecord<VectorMetadata>[],
) {
  if (records.length === 0) {
    return;
  }

  const index = await getPineconeIndex();
  const namespace = index.namespace(workspaceId);

  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    await namespace.upsert({ records: records.slice(i, i + batchSize) });
  }
}

export async function deleteSourceVectors(
  workspaceId: string,
  sourceId: string,
) {
  const index = await getPineconeIndex();
  await index.namespace(workspaceId).deleteMany({
    filter: { sourceId: { $eq: sourceId } },
  });
}

export async function deleteWorkspaceVectors(workspaceId: string) {
  const index = await getPineconeIndex();
  await index.namespace(workspaceId).deleteAll();
}

export async function queryWorkspaceVectors(
  workspaceId: string,
  vector: number[],
  topK: number,
) {
  const index = await getPineconeIndex();
  const result = await index.namespace(workspaceId).query({
    vector,
    topK,
    includeMetadata: true,
  });

  return result.matches ?? [];
}

export { indexName as PINECONE_INDEX_NAME };
