import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

export type RenameGroupRequest = {
  groupId: string;
  groupName: string;
};

export type RenameGroupResponseData = {
  groupId: string;
  groupName: string;
};

export function renameGroup(
  data: RenameGroupRequest
): Promise<ApiSuccess<RenameGroupResponseData>> {
  return request<RenameGroupResponseData>({
    method: "PATCH",
    url: "/groups/rename",
    data,
  });
}
