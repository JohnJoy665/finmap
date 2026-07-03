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

  date: Joi.string().isoDate().required().messages({
    "string.empty": "date is required",
    "string.isoDate": "date must be a valid ISO date string",
    "any.required": "date is required",
  }),
});

export const getAccountIncomesQuerySchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid uuid",
    "any.required": "accountId is required",
  }),

  limitCount: Joi.number().integer().min(1).required().messages({
    "number.base": "limitCount must be a number",
    "number.integer": "limitCount must be an integer",
    "number.min": "limitCount must be greater than 0",
    "any.required": "limitCount is required",
  }),

  offsetCount: Joi.number().integer().min(0).required().messages({
    "number.base": "offsetCount must be a number",
    "number.integer": "offsetCount must be an integer",
    "number.min": "offsetCount must be greater than or equal to 0",
    "any.required": "offsetCount is required",
  }),
});

export const renameIncomeSchema = Joi.object({
  incomeId: Joi.string().uuid().required().messages({
    "string.empty": "incomeId is required",
    "string.guid": "incomeId must be a valid UUID",
    "any.required": "incomeId is required",
  }),

  newName: Joi.string().allow("").max(100).required().messages({
    "string.max": "newName must be less than or equal to 100 characters",
    "any.required": "newName is required",
  }),
});

export const changeIncomeAmountSchema = Joi.object({
  incomeId: Joi.string().uuid().required().messages({
    "string.empty": "incomeId is required",
    "string.guid": "incomeId must be a valid uuid",
    "any.required": "incomeId is required",
  }),

  incomeAmount: Joi.string()
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
