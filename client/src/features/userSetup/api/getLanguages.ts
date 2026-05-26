import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type Languages = {
  id: number;
  code: string;
  nameOriginal: string;
};

export function getLanguagesRequest(): Promise<ApiSuccess<Languages[]>> {
  return request<Languages[]>({
    method: "GET",
    url: "/languages",
  });
}
