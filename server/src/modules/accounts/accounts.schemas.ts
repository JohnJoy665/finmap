import Joi from "joi";

export const createAcountSchema = Joi.object({
  currencyCode: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      "string.empty": "currencyCode is required",
      "string.length": "currencyCode must be 3 characters",
      "string.pattern.base": "currencyCode must contain only uppercase letters",
    }),

  accountAmount: Joi.string()
    .required()
    .allow("")
    .pattern(/^(?:0|[1-9]\d*)(?:\.(?:[1-9]|\d[1-9]))?$/)
    .messages({
      "string.base": "accountAmount must be a string",
      "any.required": "accountAmount is required",
      "string.pattern.base":
        "accountAmount must be an empty string or a valid amount, for example 0, 123, 123.2 or 123.23",
    }),
});

export const changeCurrentAccountSchema = Joi.object({
  //
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid uuid",
    "any.required": "accountId is required",
  }),
});
