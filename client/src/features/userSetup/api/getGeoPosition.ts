import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetGeopositionRequest } from "../types/requests.types";
import type { GetGeopositionResponse } from "../types/responses.type";

export function getGeoposition({
  latitude,
  longitude,
  langCode,
}: GetGeopositionRequest): Promise<ApiSuccess<GetGeopositionResponse>> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    langCode,
  });
  return request<GetGeopositionResponse>({
    method: "GET",
    url: `/geoPosition?${params.toString()}`,
  });
}
