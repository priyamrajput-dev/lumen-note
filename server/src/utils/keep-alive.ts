import { env } from "../common/config/env.js";

/**
 * Background Keep-Alive Service
 * Sends HTTP ping requests every 9 minutes to both Render backend and Vercel frontend
 * to prevent cold starts and inactive spin-downs.
 */
export function startKeepAliveService() {
  // 9 minutes in milliseconds (Render spins down free tiers after 15 minutes of inactivity)
  const PING_INTERVAL_MS = 9 * 60 * 1000;

  const backendUrl = (
    process.env.RENDER_EXTERNAL_URL ||
    env.BETTER_AUTH_URL ||
    "https://lumennote.onrender.com"
  ).replace(/\/+$/, "");

  const frontendUrl = (
    env.CLIENT_URL ||
    "https://lumen-note-priyamrajput00s-projects.vercel.app"
  ).replace(/\/+$/, "");

  const healthEndpoint = `${backendUrl}/api/health`;

  console.log(
    `[keep-alive] Service initialized. Pinging every 9 minutes:\n  - Backend: ${healthEndpoint}\n  - Frontend: ${frontendUrl}`,
  );

  const pingServices = async () => {
    try {
      const [backendRes, frontendRes] = await Promise.allSettled([
        fetch(healthEndpoint, {
          method: "GET",
          headers: { "User-Agent": "LumenNote-KeepAlive/1.0" },
        }),
        fetch(frontendUrl, {
          method: "GET",
          headers: { "User-Agent": "LumenNote-KeepAlive/1.0" },
        }),
      ]);

      const backendStatus =
        backendRes.status === "fulfilled" ? backendRes.value.status : "unreachable";
      const frontendStatus =
        frontendRes.status === "fulfilled" ? frontendRes.value.status : "unreachable";

      console.log(
        `[keep-alive] Ping check (${new Date().toLocaleTimeString()}): Backend=${backendStatus}, Frontend=${frontendStatus}`,
      );
    } catch (err) {
      console.warn("[keep-alive] Ping encountered a non-fatal error:", err);
    }
  };

  // Run the first ping after 1 minute of startup, then every 9 minutes
  const initialTimeout = setTimeout(() => {
    void pingServices();
    const interval = setInterval(pingServices, PING_INTERVAL_MS);
    // Unref so it does not block graceful process exit
    interval.unref();
  }, 60 * 1000);

  initialTimeout.unref();
}
