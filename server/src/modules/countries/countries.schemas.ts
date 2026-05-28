import Joi from "joi";

export const getCountriesQuerySchema = Joi.object({
  searchString: Joi.string().allow("").required().messages({
    "string.base": "searchString must be a string",
    "any.required": "searchString is required",
  }),

  langCode: Joi.string().length(2).lowercase().required().messages({
    "string.base": "langCode must be a string",
    "string.length": "langCode must contain 2 characters",
    "any.required": "langCode is required",
  }),
});
