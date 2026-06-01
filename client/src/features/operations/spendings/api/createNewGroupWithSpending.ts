import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { CreateNewGroupWithSpendingRequest } from "../types/requests.type";
import type { CreateNewGroupWithSpendingResponseData } from "../types/responses.type";

export function createNewGroupWithSpending(
  data: CreateNewGroupWithSpendingRequest
): Promise<ApiSuccess<CreateNewGroupWithSpendingResponseData>> {
  return request<CreateNewGroupWithSpendingResponseData>({
    method: "POST",
    url: "/groups",
    data,
  });
}
