import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";
import type { GetCategoriesResponseData } from "../types/spendings.types";

export function getCategories(): Promise<
  ApiSuccess<GetCategoriesResponseData[]>
> {
  return request<GetCategoriesResponseData[]>({
    method: "GET",
    url: "/categories",
  });
}
