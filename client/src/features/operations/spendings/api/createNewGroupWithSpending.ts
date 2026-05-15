import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type {
  CreateNewGroupWithSpendingRequest,
  CreateNewGroupWithSpendingResponseData,
} from "../../spendings/types/spendings.types";

export function createNewGroupWithSpending(
  data: CreateNewGroupWithSpendingRequest
): Promise<ApiSuccess<CreateNewGroupWithSpendingResponseData>> {
  return request<CreateNewGroupWithSpendingResponseData>({
    method: "POST",
    url: "/groups",
    data,
  });
}
