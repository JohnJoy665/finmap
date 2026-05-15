import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { Group } from "../../../../shared/types/group.types";

export function getGroupsRequest(): Promise<ApiSuccess<Group[]>> {
  return request<Group[]>({
    method: "GET",
    url: "/groups",
  });
}
