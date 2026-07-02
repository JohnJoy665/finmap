import Joi from "joi";

export const getAccountInitializationQuerySchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid UUID",
    "any.required": "accountId is required",
  }),
});

export const initializeAccountSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
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
});

export const createAccountIncomeSchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid uuid",
    "any.required": "accountId is required",
  }),

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

  name: Joi.alternatives()
    .try(
      Joi.string()
        .allow("")
        .custom((value: string) => {
          const normalizedValue = value.trim();

          if (!normalizedValue) {
            return null;
          }

          return normalizedValue;
        })
        .max(25)
        .messages({
          "string.max": "Максимум 25 символов",
        }),
      Joi.valid(null)
    )
    .optional(),

  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}$/)
    .required()
    .messages({
      "string.empty": "date is required",
      "string.pattern.base": "date must be in format YYYY-MM-DD HH:mm:ss.SSS",
      "any.required": "date is required",
    }),
});
