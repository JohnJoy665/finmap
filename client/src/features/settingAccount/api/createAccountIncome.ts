import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type CreateAccountIncomeRequest = {
  accountId: string;
  amount: string;
  name: string | null;
  date: string;
};

type CreateAccountIncomeResponseData = {
  account: {
    accountId: string;
    amount: string;
  };
  income: {
    id: string;
    accountId: string;
    name: string | null;
    amount: string;
    date: string;
    time: string;
    currencyCode: string;
    currencySymbol: string;
    conversionFactor: number;
  };
};

export function createAccountIncome(
  data: CreateAccountIncomeRequest
): Promise<ApiSuccess<CreateAccountIncomeResponseData>> {
  return request<CreateAccountIncomeResponseData>({
    method: "POST",
    url: "/incomes/account-income",
    data,
  });
}
