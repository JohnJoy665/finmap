import { request } from "../shared/api/request";
import type { ApiSuccess } from "../shared/api/types";

type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
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
  } | null;
  setupRequired: boolean;
};

export function getProfileRequest(): Promise<ApiSuccess<ProfileResponse>> {
  return request<ProfileResponse>({
    method: "GET",
    url: "/profile",
  });
}
