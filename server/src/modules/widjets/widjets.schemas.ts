import Joi from "joi";

const dateTimePattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,6})?$/;

export const getCategoryStatisticsWidgetQuerySchema = Joi.object({
  dateFromUTC: Joi.string().isoDate().required().messages({
    "string.empty": "dateFromUTC is required",
    "string.isoDate":
      "dateFromUTC must be a valid ISO date, for example 2026-06-13T11:37:34.540Z",
    "any.required": "dateFromUTC is required",
  }),

  dateToUTC: Joi.string().isoDate().required().messages({
    "string.empty": "dateToUTC is required",
    "string.isoDate":
      "dateToUTC must be a valid ISO date, for example 2026-06-13T11:37:34.540Z",
    "any.required": "dateToUTC is required",
  }),
});
