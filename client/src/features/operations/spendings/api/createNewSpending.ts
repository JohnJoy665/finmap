import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { CreateNewSpendingRequest } from "../types/requests.type";
import type { CreateNewSpendingResponseData } from "../types/responses.type";

export function createNewSpending(
  data: CreateNewSpendingRequest
): Promise<ApiSuccess<CreateNewSpendingResponseData>> {
  return request<CreateNewSpendingResponseData>({
    method: "POST",
    url: "/spendings",
    data,
  });
}
