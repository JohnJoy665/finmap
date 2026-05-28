import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetCountriesRequest } from "../types/requests.types";
import type { GetCountriesResponse } from "../types/responses.type";

export function getCountries({
  searchString,
  langCode,
}: GetCountriesRequest): Promise<ApiSuccess<GetCountriesResponse[]>> {
  const params = new URLSearchParams({
    searchString,
    langCode,
  });

  return request<GetCountriesResponse[]>({
    method: "GET",
    url: `/countries?${params.toString()}`,
  });
}
