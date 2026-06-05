import Joi from "joi";

export const createSpendingSchema = Joi.object({
  amount: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .custom((value, helpers) => {
      const amount = BigInt(value);

      const maxAmount = 100_000_000_000n; // 1 миллиард копеек

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

export const renameSpendingSchema = Joi.object({
  spendingId: Joi.string().uuid().required().messages({
    "string.empty": "spendingId is required",
    "string.guid": "spendingId must be a valid UUID",
    "any.required": "spendingId is required",
  }),

  currentName: Joi.string().trim().min(1).max(255).required().messages({
    "string.empty": "currentName is required",
    "string.min": "currentName must not be empty",
    "string.max": "currentName must be less than or equal to 255 characters",
    "any.required": "currentName is required",
  }),
});

export const changeSpendingAmountSchema = Joi.object({
  spendingId: Joi.string().uuid().required().messages({
    "string.empty": "Spending id is required",
    "string.guid": "Spending id must be UUID",
    "any.required": "Spending id is required",
  }),

  spendingAmount: Joi.string()
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
});

export const deleteSpendingParamsSchema = Joi.object({
  spendingId: Joi.string().uuid().required().messages({
    "string.guid": "spendingId must be a valid UUID",
    "any.required": "spendingId is required",
  }),
});
