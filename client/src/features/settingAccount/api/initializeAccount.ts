import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type InitializeAccountRequest = {
  accountId: string;
  amount: string;
};

type InitializeAccountResponseData = {
  accountId: string;
  amount: string;
  isInitialized: true;
};

export function initializeAccount({
  accountId,
  amount,
}: InitializeAccountRequest): Promise<
  ApiSuccess<InitializeAccountResponseData>
> {
  return request<InitializeAccountResponseData>({
    method: "POST",
    url: "/incomes/account-initialization",
    data: {
      accountId,
      amount,
    },
  });
}
