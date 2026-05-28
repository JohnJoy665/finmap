import Joi from "joi";

export const getGeoPositionQuerySchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required().messages({
    "number.base": "latitude must be a number",
    "number.min": "latitude must be greater than or equal to -90",
    "number.max": "latitude must be less than or equal to 90",
    "any.required": "latitude is required",
  }),

  longitude: Joi.number().min(-180).max(180).required().messages({
    "number.base": "longitude must be a number",
    "number.min": "longitude must be greater than or equal to -180",
    "number.max": "longitude must be less than or equal to 180",
    "any.required": "longitude is required",
  }),

  langCode: Joi.string().trim().min(2).max(10).required().messages({
    "string.base": "langCode must be a string",
    "string.empty": "langCode is required",
    "string.min": "langCode must contain at least 2 characters",
    "string.max": "langCode must contain no more than 10 characters",
    "any.required": "langCode is required",
  }),
});
