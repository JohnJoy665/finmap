import Joi from "joi";

export const getCitiesQuerySchema = Joi.object({
  langCode: Joi.string().trim().min(2).max(10).required().messages({
    "string.empty": "langCode is required",
    "string.min": "langCode must be at least 2 characters",
    "string.max": "langCode must be less than or equal to 10 characters",
    "any.required": "langCode is required",
  }),

  countryCode: Joi.string().trim().length(2).required().messages({
    "string.empty": "countryCode is required",
    "string.length": "countryCode must be exactly 2 characters",
    "any.required": "countryCode is required",
  }),

  searchString: Joi.string().trim().min(3).max(255).required().messages({
    "string.empty": "searchString is required",
    "string.min": "searchString must be at least 3 characters",
    "string.max": "searchString must be less than or equal to 255 characters",
    "any.required": "searchString is required",
  }),
});
