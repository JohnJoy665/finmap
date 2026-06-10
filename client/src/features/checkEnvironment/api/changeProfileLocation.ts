import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type ChangeProfileLocationRequest = {
  countryCode: string;
  cityId: number;
};

export type ChangeProfileLocationResponseData = {
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
};

export function changeProfileLocation(
  data: ChangeProfileLocationRequest
): Promise<ApiSuccess<ChangeProfileLocationResponseData>> {
  return request<ChangeProfileLocationResponseData>({
    method: "PATCH",
    url: "/environments/location",
    data,
  });
}
