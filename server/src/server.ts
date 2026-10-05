import { createServer } from "http";
import { createApplication } from "./app.js";
import { env } from "./common/config/env.js";
import { connectDB } from "./db/index.js";
import { connectRedis, disconnectRedis } from "./lib/redis.js";
import { startKeepAliveService } from "./utils/keep-alive.js";

async function startServer() {
  try {
    const server = createServer(createApplication());

    server.listen(env.PORT, "0.0.0.0", async () => {
      connectDB();
      await connectRedis();
      console.log(`http server is listing at PORT: ${env.PORT}`);
      startKeepAliveService();
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log("[Server] HTTP server closed");
        await disconnectRedis();
        process.exit(0);
      });

      // Force shutdown after 10s if graceful fails
      setTimeout(() => {
        console.error("[Server] Forced shutdown timeout exceeded");
        process.exit(1);
      }, 10000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error: unknown) {
    console.error(error);
  }
}

startServer();
