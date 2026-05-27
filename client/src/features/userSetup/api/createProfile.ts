import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type CreateProfileRequest = {
  languageCode: string;
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  currencyCode: string;
  uniqUserName: string;
};

export type CreateProfileResponseData = {
  userSettingsId: string;
};

export function createProfile(
  data: CreateProfileRequest
): Promise<ApiSuccess<CreateProfileResponseData>> {
  return request<CreateProfileResponseData>({
    method: "POST",
    url: "/profile",
    data,
  });
}
