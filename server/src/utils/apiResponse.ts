import type { Response } from "express";

export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) {
  const response: ApiSuccess<T> = {
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}
