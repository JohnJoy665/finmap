import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetCurrenciesRequest } from "../types/requests.types";
import type { GetCurrenciesResponse } from "../types/responses.type";

export function getCurrencies({
  langCode,
}: GetCurrenciesRequest): Promise<ApiSuccess<GetCurrenciesResponse[]>> {
  const params = new URLSearchParams({
    langCode,
  });

  return request<GetCurrenciesResponse[]>({
    method: "GET",
    url: `/currencies?${params.toString()}`,
  });
}
