import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type GetAccountInitializationRequest = {
  accountId: string;
};

type GetAccountInitializationResponseData = {
  accountId: string;
  isInitialized: boolean;
};

export function getAccountInitialization({
  accountId,
}: GetAccountInitializationRequest): Promise<
  ApiSuccess<GetAccountInitializationResponseData>
> {
  return request<GetAccountInitializationResponseData>({
    method: "GET",
    url: "/incomes/account-initialization",
    params: {
      accountId,
    },
  });
}
