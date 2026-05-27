import { request } from "../../../shared/api/request";
import type { ApiSuccess } from "../../../shared/api/types";

export type UniqNameResponse = {
  uniqUserName: string;
  isAvailable: boolean;
};

type GetUniqNameParams = {
  uniqUserName: string;
};

export function getUniqName({
  uniqUserName,
}: GetUniqNameParams): Promise<ApiSuccess<UniqNameResponse>> {
  const params = new URLSearchParams({
    uniqUserName,
  });

  return request<UniqNameResponse>({
    method: "GET",
    url: `/profile/uniqname?${params.toString()}`,
  });
}
