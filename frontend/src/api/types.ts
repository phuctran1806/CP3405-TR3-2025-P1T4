import { ApiError } from "./errors";

export type ErrorDetail = {
  loc: (string | number)[];
  msg: string;
  type: string;
};

export type ErrorType = {
  detail?: ErrorDetail[] | string;
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };


export type UserRole = "student" | "lecturer" | "admin" | "guest";

export interface User {
  email: string;
  name: string;
  phone_number: string;
  role: UserRole;
  id: string;
  student_id?: string;
  status: "active" | "inactive" | "pending";
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
