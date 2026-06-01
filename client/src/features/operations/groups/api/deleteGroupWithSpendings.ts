import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { deleteGroupWithSpendingResponse } from "../types/responses.type";

export function deleteGroupWithSpending(
  groupId: string
): Promise<ApiSuccess<deleteGroupWithSpendingResponse>> {
  return request<deleteGroupWithSpendingResponse>({
    method: "DELETE",
    url: `/groups/${groupId}`,
  });
}
