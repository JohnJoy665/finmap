import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

type DeleteSpendingResponseData = {
  accountId: string;
  accountAmount: string;
  spendingId: string;
};

export function deleteSpending(
  spendingId: string
): Promise<ApiSuccess<DeleteSpendingResponseData>> {
  return request<DeleteSpendingResponseData>({
    method: "DELETE",
    url: `/spendings/${spendingId}`,
  });
}
