export type ApiSuccess<T> = {
  data: T;
  message?: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
};

export type ApiError = {
  code: string;
  message: string;
  fields?: Record<string, string>;
  status?: number;
};
