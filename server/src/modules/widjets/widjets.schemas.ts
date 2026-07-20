import Joi from "joi";

const localDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{1,6})?$/;

export const getStatisticsWidgetQuerySchema = Joi.object({
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

  dateFromLocal: Joi.string()
    .pattern(localDateTimePattern)
    .required()
    .messages({
      "string.empty": "dateFromLocal is required",
      "string.pattern.base":
        "dateFromLocal must be a valid local date, for example 2026-07-19T00:00:00",
      "any.required": "dateFromLocal is required",
    }),

  dateToLocal: Joi.string().pattern(localDateTimePattern).required().messages({
    "string.empty": "dateToLocal is required",
    "string.pattern.base":
      "dateToLocal must be a valid local date, for example 2026-07-19T23:59:59",
    "any.required": "dateToLocal is required",
  }),
});
