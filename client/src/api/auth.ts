import { createAuthClient } from "better-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AuthSessionResponse } from "@/types";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
});

export const AUTH_QUERY_KEY = ["auth", "session"] as const;

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
      await authClient.signOut();
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

export async function signInWithGoogle() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
}
