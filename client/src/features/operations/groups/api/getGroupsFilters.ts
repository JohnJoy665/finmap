import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { GroupFilterValue } from "../../../../shared/types/group.types";
import type { GetGroupsFiltersResponse } from "../types/responses.type";

type GetGroupsFiltersParams = {
  groupFilterPeriod: GroupFilterValue | null;
  dateFromUTC?: string;
  dateToUTC?: string;
};

export async function getGroupsFilters({
  groupFilterPeriod,
  dateFromUTC,
  dateToUTC,
}: GetGroupsFiltersParams): Promise<ApiSuccess<GetGroupsFiltersResponse>> {
  return request<GetGroupsFiltersResponse>({
    method: "GET",
    url: "/groups/filters",
    params: {
      groupFilterPeriod,
      dateFromUTC,
      dateToUTC,
    },
  });
}
