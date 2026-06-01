import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { ChangeCurrentAccountRequest } from "../types/requests.type";
import type { ChangeCurrentAccountResponseData } from "../types/responses.type";

export function changeCurrentAccount(
  data: ChangeCurrentAccountRequest
): Promise<ApiSuccess<ChangeCurrentAccountResponseData>> {
  return request<ChangeCurrentAccountResponseData>({
    method: "PATCH",
    url: "/accounts/change-account",
    data,
  });
}
