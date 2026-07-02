import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type UpdateAccountNameRequest = {
  accountId: string;
  name: string;
};

type UpdateAccountNameResponseData = {
  accountId: string;
  name: string;
};

export function updateAccountName(
  data: UpdateAccountNameRequest
): Promise<ApiSuccess<UpdateAccountNameResponseData>> {
  return request<UpdateAccountNameResponseData>({
    method: "PATCH",
    url: "/accounts/name",
    data,
  });
}
