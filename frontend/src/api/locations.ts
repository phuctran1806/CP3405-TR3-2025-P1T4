import { apiFetch } from "@/api/fetcher";
import type { ApiResult } from "@/api/types";
import type { LocationResponse } from "@/api/types/location_types";

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
export async function getLocationById(locationId: string): Promise<LocationResponse | null> {
  const res = await apiFetch<LocationResponse>(`/locations/${locationId}`);
  if (!res.ok) {
    console.warn(`Failed to fetch location with ID: ${locationId}`);
    return null;
  }
  return res.data;
}
