/**
 * API base URL.
 * By default we point to the FastAPI backend running on port 8000 during development,
 * but allow overriding via EXPO_PUBLIC_API_URL for deployments.
 */
const DEFAULT_API_BASE = "http://127.0.0.1:8080";

const resolvedBase =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window === "undefined"
    ? DEFAULT_API_BASE
    : window.location.origin.includes("8081")
      ? DEFAULT_API_BASE
      : window.location.origin);

export const API_BASE_URL = resolvedBase.replace(/\/$/, "");
export const API_URL = `${API_BASE_URL}/api`;
