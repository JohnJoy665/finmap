import Joi from "joi";

export const createSpendingSchema = Joi.object({
  amount: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .custom((value, helpers) => {
      const amount = BigInt(value);

      const maxAmount = 1_000_000_000n; // 1 миллиард копеек

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
  groupId: Joi.string().uuid().required(),
  categoryId: Joi.number().integer().positive().optional(),
});

export const getSpendingsByGroupQuerySchema = Joi.object({
  groupId: Joi.string().uuid().required().messages({
    "string.empty": "groupId is required",
    "string.guid": "groupId must be a valid uuid",
    "any.required": "groupId is required",
  }),

  limitCount: Joi.number().integer().positive().required().messages({
    "number.base": "limitCount must be a number",
    "number.integer": "limitCount must be an integer",
    "number.positive": "limitCount must be positive",
    "any.required": "limitCount is required",
  }),

  offsetCount: Joi.number().integer().min(0).required().messages({
    "number.base": "offsetCount must be a number",
    "number.integer": "offsetCount must be an integer",
    "number.min": "offsetCount must be greater than or equal to 0",
    "any.required": "offsetCount is required",
  }),
});
