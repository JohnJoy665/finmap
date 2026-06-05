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
  periodType: Joi.string()
    .valid("today", "week", "month", "year")
    .default("week"),
});
