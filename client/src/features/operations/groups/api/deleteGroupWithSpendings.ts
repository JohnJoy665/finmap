import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

type ChangedAccount = {
  accountId: string;
  amount: string;
};

type deleteGroupWithSpendingResponse = {
  groupId: string;
  groupName: string;
  accounts: ChangedAccount[];
};

export function deleteGroupWithSpending(
  groupId: string
): Promise<ApiSuccess<deleteGroupWithSpendingResponse>> {
  return request<deleteGroupWithSpendingResponse>({
    method: "DELETE",
    url: `/groups/${groupId}`,
  });
}
