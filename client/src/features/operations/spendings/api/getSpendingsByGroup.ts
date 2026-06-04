import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { SpendingByGroupItem } from "../../../../shared/types/spendings,types";

export type GetSpendingsByGroupRequest = {
  groupId: string;
  limitCount: number;
  offsetCount: number;
};

export type GetSpendingsByGroupResponseData = {
  items: SpendingByGroupItem[];
  hasMore: boolean;
};

export function getSpendingsByGroup(
  params: GetSpendingsByGroupRequest
): Promise<ApiSuccess<GetSpendingsByGroupResponseData>> {
  return request<GetSpendingsByGroupResponseData>({
    method: "GET",
    url: "/spendings/group",
    params,
  });
}
