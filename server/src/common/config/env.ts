import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  CLIENT_URL: z.string(),
  DATABASE_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  CLIENT_ID: z.string(),
  CLIENT_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional().default("lumennote"),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_DEV: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  REDIS_KEY_PREFIX: z.string().optional().default("lumennote"),
  RATE_LIMIT_ENABLED: z
    .preprocess((val) => {
      if (typeof val === "string") {
        return val.toLowerCase() !== "false" && val !== "0";
      }
      return val ?? true;
    }, z.boolean())
    .default(true),
  MEM0_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
}).refine(
  (data) => {
    if (data.NODE_ENV === "production" && (!data.REDIS_URL || data.REDIS_URL === "redis://localhost:6379")) {
      return false;
    }
    return true;
  },
  {
    message: "REDIS_URL is required in production and cannot be default localhost",
    path: ["REDIS_URL"],
  },
);

const createEnv = (env: NodeJS.ProcessEnv) => {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);

  return safeParseResult.data;
};

export const env = createEnv(process.env);
