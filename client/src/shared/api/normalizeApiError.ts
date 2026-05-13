import axios from "axios";
import type { ApiError, ApiErrorBody } from "./types";

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status;
    const errorBody = error.response?.data;

    if (errorBody?.error) {
      return {
        status,
        code: errorBody.error.code,
        message: errorBody.error.message,
        fields: errorBody.error.fields,
      };
    }
    if (error.code === "ERR_NETWORK") {
      return {
        code: "NETWORK_ERROR",
        message: "Network error",
      };
    }
    return {
      status,
      code: "UNKNOWN_API_ERROR",
      message: "Unknown error",
    };
  }

  if (error instanceof Error) {
    return {
      code: "CLIENT_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Unknown error",
  };
}
