import Joi from "joi";

const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?$/;

export const getCategoryStatisticsWidgetQuerySchema = Joi.object({
  dateFrom: Joi.string().pattern(dateTimePattern).required().messages({
    "string.empty": "dateFrom is required",
    "string.pattern.base":
      "dateFrom must be in format YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm:ss.SSSSSS",
    "any.required": "dateFrom is required",
  }),

  dateTo: Joi.string().pattern(dateTimePattern).required().messages({
    "string.empty": "dateTo is required",
    "string.pattern.base":
      "dateTo must be in format YYYY-MM-DD HH:mm:ss or YYYY-MM-DD HH:mm:ss.SSSSSS",
    "any.required": "dateTo is required",
  }),
});
