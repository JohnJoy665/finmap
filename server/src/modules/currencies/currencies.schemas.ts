import Joi from "joi";

export const getCurrenciesQuerySchema = Joi.object({
  langCode: Joi.string().trim().min(2).max(3).required().messages({
    "string.base": "langCode must be a string",
    "string.empty": "langCode is required",
    "string.min": "langCode must be at least 2 characters",
    "string.max": "langCode must be at most 3 characters",
    "any.required": "langCode is required",
  }),
});
