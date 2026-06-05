import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

export type GroupFilterValue = "today" | "week" | "month" | "year";

type GetGroupsFiltersResponse = {
  value: GroupFilterValue;
  label: string;
  amount?: string;
  isActive: boolean;
};

export async function getGroupsFilters(): Promise<
  ApiSuccess<GetGroupsFiltersResponse[]>
> {
  return request<GetGroupsFiltersResponse[]>({
    method: "GET",
    url: "/groups/filters",
  });
}
