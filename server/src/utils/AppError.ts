export type ErrorFields = Record<string, string>;

export class AppError extends Error {
  statusCode: number;
  code: string;
  fields?: ErrorFields;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fields?: ErrorFields
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
