import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type CheckProfileEnvironmentRequest = {
  timezone: string;
  latitude: number | null;
  longitude: number | null;
};

export type SuggestedLocation = {
  cityId: number;
  cityName: string;
  countryCode: string;
  countryName: string;
  distanceMeters: string;
};

export type CheckProfileEnvironmentResponseData = {
  timezoneUpdated: boolean;
  positionChecked: boolean;
  locationChanged: boolean;
  suggestedLocation: SuggestedLocation | null;
};

export function checkProfileEnvironment(
  data: CheckProfileEnvironmentRequest
): Promise<ApiSuccess<CheckProfileEnvironmentResponseData>> {
  return request<CheckProfileEnvironmentResponseData>({
    method: "PATCH",
    url: "/environments/check",
    data,
  });
}
