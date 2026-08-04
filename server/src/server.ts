import { createServer } from "http";
import { createApplication } from "./app.js";
import { env } from "./common/config/env.js";
import { connectDB } from "./db/index.js";

async function startServer() {
  try {
    const server = createServer(createApplication());

    server.listen(env.PORT, () => {
      connectDB();
      console.log(`http server is listing at PORT: ${env.PORT}`);
    });
  } catch (error: unknown) {
    console.error(error);
  }
}

startServer();
