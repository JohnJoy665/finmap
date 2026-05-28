import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";
import type { GetUniqNameRequest } from "../types/requests.types";
import type { GetUniqNameResponse } from "../types/responses.type";

export function getUniqName({
  uniqUserName,
}: GetUniqNameRequest): Promise<ApiSuccess<GetUniqNameResponse>> {
  const params = new URLSearchParams({
    uniqUserName,
  });

  return request<GetUniqNameResponse>({
    method: "GET",
    url: `/profile/uniqname?${params.toString()}`,
  });
}
