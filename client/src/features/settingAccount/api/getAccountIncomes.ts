import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type IncomeItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversionFactor: number;
  currencySymbol: string;
  name: string | null;
  currencyCode: string;
};

export type GetAccountIncomesRequest = {
  accountId: string;
  limitCount: number;
  offsetCount: number;
};

export type GetAccountIncomesResponseData = {
  items: IncomeItem[];
  hasMore: boolean;
};

export function getAccountIncomes({
  accountId,
  limitCount,
  offsetCount,
}: GetAccountIncomesRequest): Promise<
  ApiSuccess<GetAccountIncomesResponseData>
> {
  return request<GetAccountIncomesResponseData>({
    method: "GET",
    url: "/incomes",
    params: {
      accountId,
      limitCount,
      offsetCount,
    },
  });
}
