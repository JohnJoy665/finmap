import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

export type RenameSpendingRequest = {
  spendingId: string;
  currentName: string;
};

export type RenameSpendingResponseData = {
  spendingId: string;
  currentName: string;
};

export function renameSpending(
  data: RenameSpendingRequest
): Promise<ApiSuccess<RenameSpendingResponseData>> {
  return request<RenameSpendingResponseData>({
    method: "PATCH",
    url: "/spendings/rename",
    data,
  });
}
