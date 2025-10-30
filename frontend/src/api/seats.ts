import { apiFetch } from "@/api/fetcher";
import type { ApiResult } from "@/api/types";

export type SeatStatus = "available" | "occupied" | "maintenance";

export interface SeatResponse {
  id: string;
  name: string;
  floor_id: string;
  status: SeatStatus;
  seat_type: string;
  has_power_outlet: boolean;
  has_wifi: boolean;
  has_ac: boolean;
  is_accessible: boolean;
}

export interface SeatQuery {
  floor_id?: string;
  status?: SeatStatus;
  seat_type?: string;
  skip?: number;
  limit?: number;
}

export interface AvailableSeatQuery {
  floor_id?: string;
  has_power?: boolean;
  has_ac?: boolean;
  has_wifi?: boolean;
}

/**
 * Fetch all seats (optionally filtered by floor, type, etc.)
 */
export async function fetchSeats(
  params: SeatQuery = {}
): Promise<ApiResult<SeatResponse[]>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.append(key, String(value));
  });

  return apiFetch<SeatResponse[]>(`/seats/?${query.toString()}`);
}

/**
 * Fetch available seats (optionally filtered by features)
 */
export async function fetchAvailableSeats(
  params: AvailableSeatQuery = {}
): Promise<ApiResult<SeatResponse[]>> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.append(key, String(value));
  });

  return apiFetch<SeatResponse[]>(`/seats/available?${query.toString()}`);
}

/**
 * Fetch single seat by ID
 */
export async function fetchSeatById(
  seatId: string
): Promise<ApiResult<SeatResponse>> {
  return apiFetch<SeatResponse>(`/seats/${seatId}`);
}

