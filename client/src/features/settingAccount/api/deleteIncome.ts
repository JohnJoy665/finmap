import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type DeleteIncomeResponseData = {
  accountId: string;
  accountAmount: string;
  incomeId: string;
};

export function deleteIncome(
  incomeId: string
): Promise<ApiSuccess<DeleteIncomeResponseData>> {
  return request<DeleteIncomeResponseData>({
    method: "DELETE",
    url: `/incomes/${incomeId}`,
  });
}
