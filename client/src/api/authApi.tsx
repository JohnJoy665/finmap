import { apiClient } from "./apiClient";
import type { User } from "../types/user.type";

type LoginDto = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

type MeResponse = {
  user: User;
};

export async function loginRequest(data: LoginDto) {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
}

export async function meResponse() {
  const response = await apiClient.get<MeResponse>("/me");
  return response.data;
}
