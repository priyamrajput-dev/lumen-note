import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
});

const createEnv = (env: NodeJS.ProcessEnv) => {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);

  return safeParseResult.data;
};

export const env = createEnv(process.env);
