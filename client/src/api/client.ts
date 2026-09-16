import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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
