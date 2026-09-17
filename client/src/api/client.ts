import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_SERVER_URL) {
    return `${import.meta.env.VITE_SERVER_URL.replace(/\/+$/, "")}/api`;
  }
  return import.meta.env.VITE_API_URL || "/api";
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lumen_auth_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  const token = response.headers["set-auth-token"];
  if (token && typeof window !== "undefined") {
    localStorage.setItem("lumen_auth_token", token);
  }
  return response;
});

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    if (axiosErr.response?.data?.error) {
      const details = axiosErr.response.data.details;
      if (typeof details === "string") {
        return `${axiosErr.response.data.error}: ${details}`;
      }
      if (details && typeof details === "object") {
        return `${axiosErr.response.data.error}: ${JSON.stringify(details)}`;
      }
      return axiosErr.response.data.error;
    }
    if (axiosErr.response?.data?.message) {
      return axiosErr.response.data.message;
    }
    if (axiosErr.message) {
      return axiosErr.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
}
