// types/lecture_location_type.ts

export type LocationState = "active" | "maintenance";

export interface LecturerLocationBase {
  id: string;
  code: string;
  name: string;
  image_url?: string | null;
  capacity: number;
  subject: string;
  start_time?: string | null;  // ISO string from backend
  end_time?: string | null;
  live_occupancy?: number | null;
  state: LocationState;
  lecturer_email?: string | null;
}

export interface LecturerLocationResponse extends LecturerLocationBase {
  created_at: string;  // ISO date string
  updated_at: string;
}

/**
 * Admin-only payload: assign a lecturer to a room.
 */
export interface LecturerLocationAssign {
  id: string;
  lecturer_email: string;
  start_time: string; // ISO format (e.g., new Date().toISOString())
  end_time: string;
}

/**
 * Admin-only payload: update or reassign a lecturer’s room.
 */
export interface LecturerLocationUpdate {
  id: string;
  code?: string;
  name?: string;
  image_url?: string;
  capacity?: number;
  subject?: string;
  start_time?: string;
  end_time?: string;
  lecturer_email?: string;
  state?: LocationState;
}
