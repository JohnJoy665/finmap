import Joi from "joi";

export const createGroupSchema = Joi.object({
  groupName: Joi.string().min(2).max(25).required(),
  categoryId: Joi.number().integer().positive().required(),
  amount: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .custom((value, helpers) => {
      const amount = BigInt(value);

      const maxAmount = 1_000_000_000_000n; // 1 миллиард копеек

      if (amount > maxAmount) {
        return helpers.error("amount.max");
      }

      return value;
    })
    .required()
    .messages({
      "string.pattern.base": "Amount must be a positive integer string",
      "amount.max": "Amount is too large",
      "any.required": "Amount is required",
    }),
});

export const getGroupSchema = Joi.object({
  dateFromUTC: Joi.string().isoDate().required(),
  dateToUTC: Joi.string().isoDate().required(),
});

export const getGroupsFiltersQuerySchema = Joi.object({
  groupFilterPeriod: Joi.string()
    .valid("today", "week", "month", "year", "custom")
    .optional(),

  dateFromUTC: Joi.date().iso().optional(),
  dateToUTC: Joi.date().iso().optional(),
}).unknown(false);
