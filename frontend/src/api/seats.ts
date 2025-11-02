import { apiFetch } from "@/api/fetcher";
import buildQuery from "@/utils/buildQuery";
import type { ApiResult } from "@/api/types";

export interface SeatResponse {
  id: string;
  seat_number: string;
  seat_type: string;
  has_power_outlet: boolean;
  has_wifi: boolean;
  has_ac: boolean;
  accessibility: boolean;
  capacity: number;
  floor_id: string;
  x_coordinate?: number | null;
  y_coordinate?: number | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SeatAvailability {
  seat: SeatResponse;
  is_available: boolean;
  next_available_time?: string | null;
}

/**
 * GET /seats
 * Fetch a list of seats with optional filters
 */
export async function getSeats(params?: {
  floor_id?: string;
  status?: string;
  seat_type?: string;
  skip?: number;
  limit?: number;
}): Promise<ApiResult<SeatResponse[]>> {
  const query = buildQuery(params ?? {});
  return apiFetch<SeatResponse[]>(`/seats/${query}`);
}

/**
 * GET /seats/available
 * Fetch available seats with optional filters
 */
export async function getAvailableSeats(params?: {
  floor_id?: string;
  has_power?: boolean;
  has_ac?: boolean;
  has_wifi?: boolean;
}): Promise<ApiResult<SeatResponse[]>> {
  const query = buildQuery(params ?? {});
  return apiFetch<SeatResponse[]>(`/seats/available${query}`);
}

/**
 * GET /seats/{seat_id}
 * Fetch a seat by ID
 */
export async function getSeatById(seat_id: string): Promise<ApiResult<SeatResponse>> {
  return apiFetch<SeatResponse>(`/seats/${seat_id}`);
}
