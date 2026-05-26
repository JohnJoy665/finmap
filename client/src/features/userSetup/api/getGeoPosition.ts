import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type GeoPosition = {
  cityId: number;
  countryCode: string;
  cityLocalName: string | null;
  cityInternationalName: string | null;
  featureCode: string;
  population: number | null;
  countryName: string;
  countryId: number;
};

type GeoPositionRequest = {
  latitude: number;
  longitude: number;
  langCode: string;
};

export function postGeoposition(
  data: GeoPositionRequest
): Promise<ApiSuccess<GeoPosition>> {
  return request<GeoPosition>({
    method: "POST",
    url: "/geoPosition",
    data,
  });
}
