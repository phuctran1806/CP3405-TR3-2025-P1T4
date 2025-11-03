import { apiFetch } from "./fetcher";
import type { ApiResult } from "./types";

export interface OccupancyHistory {
  id: string;
  location_id: string;
  floor_id: string;
  timestamp: string;
  occupancy_count: number;
  total_capacity: number;
  occupancy_percentage: number;
  day_of_week: number;
  hour_of_day: number;
}

export async function getOccupancyHistory(locationId: string, limit: string = "100"): Promise<ApiResult<OccupancyHistory[]>> {
  return apiFetch(`/iot/occupancy/history?location_id=${locationId}&limit=${limit}`);
}
