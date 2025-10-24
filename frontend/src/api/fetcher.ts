import { API_URL } from "@/api/config";
import { ApiError } from "@/api/errors";
import type { ErrorType, ApiResult } from "@/api/types";

// Runtime validators
function isErrorDetail(obj: any): obj is ErrorType {
  return (
    obj != null &&
    Array.isArray(obj.loc) &&
    obj.loc.every((v: any) => typeof v === "string" || typeof v === "number") &&
    typeof obj.msg === "string" &&
    typeof obj.type === "string"
  );
}

function isErrorType(obj: any): obj is ErrorType {
  if (obj == null) return false;

  if (typeof obj.detail === "string") return true;
  if (Array.isArray(obj.detail) && obj.detail.every(isErrorDetail)) return true;

  return false;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type":
        options.headers && (options.headers as Record<string, string>)["Content-Type"]
          ? (options.headers as Record<string, string>)["Content-Type"]
          : "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let parsed: unknown;
    try {
      parsed = await res.json();
    } catch {
      const text = await res.text().catch(() => "");
      return { ok: false, error: new ApiError(text || "Invalid error response", res.status) };
    }

    if (!isErrorType(parsed)) {
      return {
        ok: false,
        error: new ApiError(`Unexpected error shape: ${JSON.stringify(parsed)}`, res.status),
      };
    }

    const err = parsed;

    const message = Array.isArray(err.detail)
      ? err.detail.map(d => `${d.msg} (${d.type}) at ${d.loc.join(".")}`).join("\n")
      : typeof err.detail === "string"
      ? err.detail
      : "API request failed";

    return { ok: false, error: new ApiError(message, res.status) };
  }

  const json = (await res.json()) as T;
  return { ok: true, data: json };
}

