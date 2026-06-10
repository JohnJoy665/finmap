import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { GroupFilterValue } from "../../../../shared/types/group.types";
import type { GetGroupsFiltersResponse } from "../types/responses.type";

type GetGroupsFiltersParams = {
  groupFilterPeriod: GroupFilterValue | null;
};

export async function getGroupsFilters({
  groupFilterPeriod,
}: GetGroupsFiltersParams): Promise<ApiSuccess<GetGroupsFiltersResponse[]>> {
  return request<GetGroupsFiltersResponse[]>({
    method: "GET",
    url: "/groups/filters",
    params: { groupFilterPeriod },
  });
}
