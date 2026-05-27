import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetLanguagesResponse } from "../types/responses.type";

export function getLanguages(): Promise<ApiSuccess<GetLanguagesResponse[]>> {
  return request<GetLanguagesResponse[]>({
    method: "GET",
    url: "/languages",
  });
}
