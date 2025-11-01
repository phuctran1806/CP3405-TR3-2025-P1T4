export interface LecturerAssignmentRequest {
  id: string;
  subject: string;
  start_time: Date;
  end_time: Date;
  location_id: string;
  user_id: string;
}

export interface LecturerAssignmentResponse {
  created_at: Date;
  updated_at: Date;
}