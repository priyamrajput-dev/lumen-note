import { createAuthClient } from "better-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AuthSessionResponse } from "@/types";

const getAuthBaseUrl = (): string => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "");
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.startsWith("http")) {
    return apiUrl.replace(/\/api\/?$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "";
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
});

export const AUTH_QUERY_KEY = ["auth", "session"] as const;

export function isDemoMode(): boolean {
  return false;
}

export function exitDemoMode(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lumen_demo_session");
    localStorage.removeItem("lumen_demo_workspaces");
    localStorage.removeItem("lumen_demo_sources");
    localStorage.removeItem("lumen_demo_memories");
  }
}

export async function fetchSession(): Promise<AuthSessionResponse | null> {
  try {
    const res = await apiClient.get<AuthSessionResponse | null>("/auth/get-session");
    return res.data;
  } catch (err) {
    return null;
  }
}

export function useAuthSession() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      exitDemoMode();
      try {
        await authClient.signOut();
      } catch (e) {
        // ignore
      }
    },
    onSuccess: () => {
      exitDemoMode();
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

export async function signInWithGoogle() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  await authClient.signIn.social({
    provider: "google",
    callbackURL: `${origin}/dashboard`,
  });
}
