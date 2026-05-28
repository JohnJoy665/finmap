import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetCitiesRequest } from "../types/requests.types";
import type { GetCitiesResponse } from "../types/responses.type";

export function getCities({
  searchString,
  langCode,
  countryCode,
}: GetCitiesRequest): Promise<ApiSuccess<GetCitiesResponse[]>> {
  const params = new URLSearchParams({
    searchString,
    langCode,
    countryCode,
  });

  return request<GetCitiesResponse[]>({
    method: "GET",
    url: `/cities?${params.toString()}`,
  });
}
