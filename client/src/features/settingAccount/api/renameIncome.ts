import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type RenameIncomeRequest = {
  incomeId: string;
  newName: string;
};

export type RenameIncomeResponseData = {
  incomeId: string;
  currentName: string | null;
};

export function renameIncome(
  data: RenameIncomeRequest
): Promise<ApiSuccess<RenameIncomeResponseData>> {
  return request<RenameIncomeResponseData>({
    method: "PATCH",
    url: "/incomes/rename",
    data,
  });
}
