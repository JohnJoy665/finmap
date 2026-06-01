import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type CreateAccountRequest = {
  currencyCode: string;
  accountAmount: string;
};

type CreateAccountResponseData = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
};

export function createAccount(
  data: CreateAccountRequest
): Promise<ApiSuccess<CreateAccountResponseData>> {
  return request<CreateAccountResponseData>({
    method: "POST",
    url: "/accounts",
    data,
  });
}
