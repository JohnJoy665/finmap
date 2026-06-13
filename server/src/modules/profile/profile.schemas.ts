import Joi from "joi";

export const createProfileSchema = Joi.object({
  languageCode: Joi.string()
    .length(2)
    .pattern(/^[a-z]{2}$/)
    .required()
    .messages({
      "string.empty": "languageCode is required",
      "string.length": "languageCode must be 2 characters",
      "string.pattern.base": "languageCode must contain only lowercase letters",
    }),

  countryCode: Joi.string()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .required()
    .messages({
      "string.empty": "countryCode is required",
      "string.length": "countryCode must be 2 characters",
      "string.pattern.base": "countryCode must contain only uppercase letters",
    }),

  countryName: Joi.string().min(1).max(255).required().messages({
    "string.empty": "countryName is required",
    "string.max": "countryName must be less than or equal to 255 characters",
  }),

  cityId: Joi.number().integer().positive().required().messages({
    "number.base": "cityId must be a number",
    "number.integer": "cityId must be an integer",
    "number.positive": "cityId must be positive",
    "any.required": "cityId is required",
  }),

  cityName: Joi.string().min(1).max(255).required().messages({
    "string.empty": "cityName is required",
    "string.max": "cityName must be less than or equal to 255 characters",
  }),

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

  uniqUserName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)
    .required()
    .messages({
      "string.empty": "Введите имя",
      "string.min": "Минимум 3 символа",
      "string.max": "Максимум 30 символов",
      "string.pattern.base": "Допустимы латинские символы, цифры, -, _",
      "any.required": "Введите имя",
    }),

  timezone: Joi.string().min(1).max(64).required().messages({
    "string.empty": "timezone is required",
    "string.max": "timezone must be less than or equal to 64 characters",
    "any.required": "timezone is required",
  }),
});

export const getUniqNameQuerySchema = Joi.object({
  uniqUserName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z][a-zA-Z0-9_-]*$/)
    .required()
    .messages({
      "string.empty": "Введите имя",
      "string.min": "Минимум 3 символа",
      "string.max": "Максимум 30 символов",
      "string.pattern.base": "Допустимы латинские символы, цифры, -, _",
      "any.required": "Введите имя",
    }),
});

function isValidTimeZone(value: string, helpers: Joi.CustomHelpers) {
  const timezone = value.trim();

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    return helpers.error("any.invalid");
  }
}

export const updateProfileTimezoneSchema = Joi.object({
  timezone: Joi.string()
    .trim()
    .min(1)
    .max(64)
    .custom(isValidTimeZone)
    .required()
    .messages({
      "string.base": "Timezone must be a string",
      "string.empty": "Timezone is required",
      "string.min": "Timezone is required",
      "string.max": "Timezone must be less than or equal to 64 characters",
      "any.invalid": "Timezone is not valid",
      "any.required": "Timezone is required",
    }),
});
