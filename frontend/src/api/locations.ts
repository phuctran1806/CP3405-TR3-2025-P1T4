import { apiFetch } from "@/api/fetcher";
import type { ApiResult } from "@/api/types";

export type LocationStatus = "open" | "closed" | "busy" | "unknown";

export interface LocationResponse {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_capacity: number;
  current_occupancy: number;
  busyness_percentage: number;
  available_seats: number;
  status: LocationStatus;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Fetch all locations.
 * GET /locations/
 */
export async function getLocations(): Promise<ApiResult<LocationResponse[]>> {
  return await apiFetch<LocationResponse[]>("/locations/");
}

/**
 * Fetch a specific location by ID.
 * GET /locations/{location_id}
 */
export async function getLocationById(
  locationId: string
): Promise<ApiResult<LocationResponse>> {
  return await apiFetch<LocationResponse>(`/locations/${locationId}`);
}

