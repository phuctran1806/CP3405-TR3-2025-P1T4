export type LocationStatus = "open" | "closed" | "maintenance";
export type LocationType = "public" | "private";

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
  has_power_outlet: boolean;
  has_ac: boolean;
  is_quiet: boolean;
  status: LocationStatus;
  location_type: LocationType;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}