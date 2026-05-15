import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type {
  CreateNewSpendingRequest,
  CreateNewSpendingResponseData,
} from "../types/spendings.types";

export function createNewSpending(
  data: CreateNewSpendingRequest
): Promise<ApiSuccess<CreateNewSpendingResponseData>> {
  return request<CreateNewSpendingResponseData>({
    method: "POST",
    url: "/spendings",
    data,
  });
}
