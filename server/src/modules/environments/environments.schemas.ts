import Joi from "joi";

export const checkProfileEnvironmentSchema = Joi.object({
  timezone: Joi.string().min(1).max(64).required().messages({
    "string.empty": "timezone is required",
    "string.max": "timezone must be less than or equal to 64 characters",
    "any.required": "timezone is required",
  }),

  latitude: Joi.number().min(-90).max(90).allow(null).required().messages({
    "number.base": "latitude must be a number",
    "number.min": "latitude must be greater than or equal to -90",
    "number.max": "latitude must be less than or equal to 90",
    "any.required": "latitude is required",
  }),

  longitude: Joi.number().min(-180).max(180).allow(null).required().messages({
    "number.base": "longitude must be a number",
    "number.min": "longitude must be greater than or equal to -180",
    "number.max": "longitude must be less than or equal to 180",
    "any.required": "longitude is required",
  }),
});

export const changeProfileLocationSchema = Joi.object({
  countryCode: Joi.string()
    .length(2)
    .pattern(/^[A-Z]{2}$/)
    .required()
    .messages({
      "string.empty": "countryCode is required",
      "string.length": "countryCode must be 2 characters",
      "string.pattern.base": "countryCode must contain only uppercase letters",
    }),

  cityId: Joi.number().integer().positive().required().messages({
    "number.base": "cityId must be a number",
    "number.integer": "cityId must be an integer",
    "number.positive": "cityId must be positive",
    "any.required": "cityId is required",
  }),
});
