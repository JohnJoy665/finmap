import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { Account } from "../../../shared/types/account.types";

export function getAccounts(): Promise<ApiSuccess<Account[]>> {
  return request<Account[]>({
    method: "GET",
    url: "/accounts",
  });
}
