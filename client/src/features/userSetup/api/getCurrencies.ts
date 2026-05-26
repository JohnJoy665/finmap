import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type Currency = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  conversionFactor: number;
};

type GetCurrenciesParams = {
  langCode: string;
};

export function getCurrencies({
  langCode,
}: GetCurrenciesParams): Promise<ApiSuccess<Currency[]>> {
  const params = new URLSearchParams({
    langCode,
  });

  return request<Currency[]>({
    method: "GET",
    url: `/currencies?${params.toString()}`,
  });
}
