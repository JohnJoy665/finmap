import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type ChangeIncomeAmountRequest = {
  incomeId: string;
  incomeAmount: string;
};

export type ChangeIncomeAmountResponseData = {
  incomeId: string;
  incomeAmount: string;
  accountId: string;
  accountAmount: string;
};

export function changeIncomeAmount(
  data: ChangeIncomeAmountRequest
): Promise<ApiSuccess<ChangeIncomeAmountResponseData>> {
  return request<ChangeIncomeAmountResponseData>({
    method: "PATCH",
    url: "/incomes/amount",
    data,
  });
}
