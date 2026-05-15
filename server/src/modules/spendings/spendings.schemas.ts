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
