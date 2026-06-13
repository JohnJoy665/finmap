import { request } from "../shared/api/request";
import type { ApiSuccess } from "../shared/api/types";
import type { User } from "../types/user.type";

type ProfileResponse = {
  user: User | null;
  account: {
    id: string;
    currencyCode: string;
    amount: string;
    currencySymbol: string;
    conversionFactor: number;
  } | null;
  settings: {
    id: string;
    accountId: string | null;
    languageCode: string | null;
    countryCode: string | null;
    cityId: number | null;
    visibleAccount: boolean;
    visibleUserName: boolean;
    visibleGroupSpendings: boolean;
    visibleAverageGroupBill: boolean;
    currencyCode: string | null;
    currencySymbol: string | null;
    conversionFactor: number | null;
    lastCheckPosition: string | null;
    timezone: string | null;
  } | null;
  setupRequired: boolean;
};

export function getProfileRequest(): Promise<ApiSuccess<ProfileResponse>> {
  return request<ProfileResponse>({
    method: "GET",
    url: "/profile",
  });
}

type UpdateProfileTimezoneResponse = {
  timezone: string;
  timezoneUpdated: boolean;
};
export function updateProfileTimezone(
  timezone: string
): Promise<ApiSuccess<UpdateProfileTimezoneResponse>> {
  return request<UpdateProfileTimezoneResponse>({
    method: "PATCH",
    url: "/profile/timezone",
    data: {
      timezone,
    },
  });
}
