import { request } from "../shared/api/request";
import type { ApiSuccess } from "../shared/api/types";
// import { apiClient } from "./apiClient";

// export async function profileRequest() {
//   const response = await apiClient.get("/profile");
//   return response.data;
// }

type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  account: {
    id: string;
    currencyCode: string;
    amount: number;
    currencySymbol: string;
  };
};

export function getProfileRequest(): Promise<ApiSuccess<ProfileResponse>> {
  return request<ProfileResponse>({
    method: "GET",
    url: "/profile",
  });
}
