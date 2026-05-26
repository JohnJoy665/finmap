import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type City = {
  cityId: number;
  cityName: string;
};

type GetCitiesParams = {
  searchString: string;
  langCode: string;
  countryCode: string;
};

export function getCities({
  searchString,
  langCode,
  countryCode,
}: GetCitiesParams): Promise<ApiSuccess<City[]>> {
  const params = new URLSearchParams({
    searchString,
    langCode,
    countryCode,
  });

  return request<City[]>({
    method: "GET",
    url: `/cities?${params.toString()}`,
  });
}
