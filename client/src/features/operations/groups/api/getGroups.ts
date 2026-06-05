import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { Group } from "../../../../shared/types/group.types";

export type GroupFilterValue = "today" | "week" | "month" | "year";

type getGroupsRequest = {
  periodType: GroupFilterValue;
};

export function getGroupsRequest({
  periodType,
}: getGroupsRequest): Promise<ApiSuccess<Group[]>> {
  return request<Group[]>({
    method: "GET",
    url: "/groups",
    params: {
      periodType,
    },
  });
}
