import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

type deleteGroupWithSpendingResponse = {
  accountAmount: string;
  groupId: string;
  groupName: string;
};

export function deleteGroupWithSpending(
  groupId: string
): Promise<ApiSuccess<deleteGroupWithSpendingResponse>> {
  return request<deleteGroupWithSpendingResponse>({
    method: "DELETE",
    url: `/groups/${groupId}`,
  });
}
