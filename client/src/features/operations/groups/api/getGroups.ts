import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { Group } from "../../../../shared/types/group.types";
import type { GetGroupsRequest } from "../types/requests.types";

export function getGroupsRequest({
  dateFromUTC,
  dateToUTC,
}: GetGroupsRequest): Promise<ApiSuccess<Group[]>> {
  return request<Group[]>({
    method: "GET",
    url: "/groups",
    params: {
      dateFromUTC,
      dateToUTC,
    },
  });
}
