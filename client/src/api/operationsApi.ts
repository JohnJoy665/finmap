import { request } from "../shared/api/request";
import type { ApiSuccess } from "../shared/api/types";

type CategoryResponseData = {
  id: number;
  code: string;
  translation: string;
};

export type CreateGroupRequest = {
  groupName: string;
  categoryId: number;
  amount: string;
  conversionFactor: number;
  currencyCode: string;
  accountId: string;
};

export function getCategories(): Promise<ApiSuccess<CategoryResponseData[]>> {
  return request<CategoryResponseData[]>({
    method: "GET",
    url: "/categories",
  });
}

type CreateGroupResponseData = {
  groupId: string;
  groupName: string;
  spendingId: string;
  accountAmount: number;
};

export function createGroup(
  data: CreateGroupRequest
): Promise<ApiSuccess<CreateGroupResponseData>> {
  return request<CreateGroupResponseData>({
    method: "POST",
    url: "/groups",
    data,
  });
}
