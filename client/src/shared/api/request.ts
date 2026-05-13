import type { AxiosRequestConfig } from "axios";
import type { ApiSuccess } from "./types";
import { apiClient } from "../../api/apiClient";
import { normalizeApiError } from "./normalizeApiError";

export async function request<T>(
  config: AxiosRequestConfig
): Promise<ApiSuccess<T>> {
  try {
    const response = await apiClient.request<ApiSuccess<T>>(config);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
