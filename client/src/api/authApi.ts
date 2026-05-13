// import { apiClient } from "./apiClient";
import type { User } from "../types/user.type";
import type { ApiSuccess } from "../shared/api/types";
import { request } from "../shared/api/request";

type LoginDto = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

export function getMeRequest(): Promise<ApiSuccess<User>> {
  return request<User>({
    method: "GET",
    url: "/me",
  });
}

export async function getLoginRequest(
  data: LoginDto
): Promise<ApiSuccess<LoginResponse>> {
  return request<LoginResponse>({
    method: "POST",
    url: "/auth/login",
    data,
  });
}
