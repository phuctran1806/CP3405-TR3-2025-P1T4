import { apiFetch } from "@/api/fetcher";
import type { UserRole, User, ApiResult } from "@/api/types";


export interface LoginParams {
  email: string,
  password: string
  role: UserRole,
}

export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  user: User;
}

export async function login(body: LoginParams): Promise<ApiResult<LoginResponse>> {
  const form = new URLSearchParams();
  form.append("email", body.email);
  form.append("password", body.password);
  form.append("role", body.role)

  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export interface SignupParams {
  email: string,
  name: string,
  phone_number: string,
  role: UserRole,
  password: string,
  student_id?: string
}

export type SignupResponse = LoginResponse

export async function signup(body: SignupParams): Promise<ApiResult<SignupResponse>> {
  return apiFetch<SignupResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

