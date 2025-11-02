import { apiFetch } from "@/api/fetcher";
import type { ApiResult } from "@/api/types";

/**
 * Upload an image file to the server.
 * Returns the uploaded image URL.
 */
export async function uploadImage(file: File): Promise<ApiResult<{ url: string }>> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ url: string }>("/images/upload", {
    method: "POST",
    body: formData,
    // Override default header: let browser set multipart boundaries
    headers: {},
  });
}

