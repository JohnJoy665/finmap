import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

export type ChangeSpendingAmountRequest = {
  spendingId: string;
  spendingAmount: string;
};

export type ChangeSpendingAmountResponseData = {
  spendingId: string;
  spendingAmount: string;
  baseAmountMicro: string | null;
  accountId: string;
  accountAmount: string;
};

export function changeSpendingAmount(
  data: ChangeSpendingAmountRequest
): Promise<ApiSuccess<ChangeSpendingAmountResponseData>> {
  return request<ChangeSpendingAmountResponseData>({
    method: "PATCH",
    url: "/spendings/amount",
    data,
  });
}
