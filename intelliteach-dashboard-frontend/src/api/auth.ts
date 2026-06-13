import apiClient from "./client";
import type { Token, User, UserRole } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// FastAPI's OAuth2PasswordRequestForm expects form data, not JSON
export async function login(payload: LoginPayload): Promise<Token> {
  const formData = new URLSearchParams();
  formData.append("username", payload.email); // FastAPI uses 'username' field
  formData.append("password", payload.password);

  const { data } = await apiClient.post<Token>("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
