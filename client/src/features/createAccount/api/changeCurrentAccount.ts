import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type ChangeCurrentAccountRequest = {
  accountId: string;
};

export type ChangeCurrentAccountResponseData = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
};

export function changeCurrentAccount(
  data: ChangeCurrentAccountRequest
): Promise<ApiSuccess<ChangeCurrentAccountResponseData>> {
  return request<ChangeCurrentAccountResponseData>({
    method: "PATCH",
    url: "/accounts/change-account",
    data,
  });
}
