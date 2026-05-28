import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { CreateProfileRequest } from "../types/requests.types";
import type { CreateProfileResponseData } from "../types/responses.type";

export function createProfile(
  data: CreateProfileRequest
): Promise<ApiSuccess<CreateProfileResponseData>> {
  return request<CreateProfileResponseData>({
    method: "POST",
    url: "/profile",
    data,
  });
}
