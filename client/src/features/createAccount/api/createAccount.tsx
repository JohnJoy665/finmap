import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { CreateAccountRequest } from "../types/requests.type";
import type { CreateAccountResponseData } from "../types/responses.type";

export function createAccount(
  data: CreateAccountRequest
): Promise<ApiSuccess<CreateAccountResponseData>> {
  return request<CreateAccountResponseData>({
    method: "POST",
    url: "/accounts",
    data,
  });
}
