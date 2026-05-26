import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

type Country = {
  countryName: string;
  countryCode?: string;
  countryId?: number;
};

type GetCountriesParams = {
  searchString: string;
  langCode: string;
};

export function getCountries({
  searchString,
  langCode,
}: GetCountriesParams): Promise<ApiSuccess<Country[]>> {
  const params = new URLSearchParams({
    searchString,
    langCode,
  });

  return request<Country[]>({
    method: "GET",
    url: `/countries?${params.toString()}`,
  });
}
