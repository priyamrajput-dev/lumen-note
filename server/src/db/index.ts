import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../common/config/env.js";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});
export const db = drizzle({ client: pool });

export async function connectDB() {
  const q = await pool.query("SELECT 1");
  console.log("Postgres is Connected", q.rows[0]);
}
