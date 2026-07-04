import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type CorrectAccountAmountRequest = {
  accountId: string;
  amount: string;
};

export type CorrectAccountAmountResponseData = {
  accountId: string;
  accountAmount: string;
};

export function correctAccountAmount(
  data: CorrectAccountAmountRequest
): Promise<ApiSuccess<CorrectAccountAmountResponseData>> {
  return request<CorrectAccountAmountResponseData>({
    method: "PATCH",
    url: "/accounts/correction",
    data,
  });
}
