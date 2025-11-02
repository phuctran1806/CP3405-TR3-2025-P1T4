import { apiFetch } from "@/api/fetcher";
import buildQuery from "@/utils/buildQuery";
import type { ApiResult } from "@/api/types";
import type { SeatResponse } from "@/api/seats";

/** 
 * Floor response schema (matches FastAPI FloorResponse)
 */
export interface FloorResponse {
  id: string;
  location_id: string;
  floor_number: number;
  floor_name?: string | null;
  floor_map_url?: string | null;
  total_seats: number;
  occupied_seats: number;
  is_best_floor: boolean;
  status: string;
  busyness_percentage: number;
  available_seats: number;
  created_at: string;
  updated_at: string;
}

/** 
 * Floor with seats (matches FastAPI FloorWithSeats)
 */
export interface FloorWithSeats extends FloorResponse {
  seats: SeatResponse[];
}

/**
 * GET /floors
 * Fetch all floors (optionally filtered by location_id)
 */
export async function getFloors(params?: {
  location_id?: string;
}): Promise<ApiResult<FloorResponse[]>> {
  const query = buildQuery(params ?? {});
  return apiFetch<FloorResponse[]>(`/floors/${query}`);
}

/**
 * GET /floors/{floor_id}
 * Fetch a single floor by ID
 */
export async function getFloorById(
  floor_id: string
): Promise<ApiResult<FloorResponse>> {
  return apiFetch<FloorResponse>(`/floors/${floor_id}`);
}

/**
 * GET /floors/{floor_id}/seats
 * Fetch a floor and its seats
 */
export async function getFloorWithSeats(
  floor_id: string
): Promise<ApiResult<FloorWithSeats>> {
  return apiFetch<FloorWithSeats>(`/floors/${floor_id}/seats`);
}

