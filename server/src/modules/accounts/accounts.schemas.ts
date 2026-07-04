import Joi from "joi";

export const createAcountSchema = Joi.object({
  currencyCode: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      "string.empty": "currencyCode is required",
      "string.length": "currencyCode must be 3 characters",
      "string.pattern.base": "currencyCode must contain only uppercase letters",
    }),

  accountAmount: Joi.string()
    .required()
    .allow("")
    .pattern(/^(?:0|[1-9]\d*)(?:\.(?:[1-9]|\d[1-9]))?$/)
    .messages({
      "string.base": "accountAmount must be a string",
      "any.required": "accountAmount is required",
      "string.pattern.base":
        "accountAmount must be an empty string or a valid amount, for example 0, 123, 123.2 or 123.23",
    }),
});

export const changeCurrentAccountSchema = Joi.object({
  //
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid uuid",
    "any.required": "accountId is required",
  }),
});

export const updateAccountNameSchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    "string.empty": "accountId is required",
    "string.guid": "accountId must be a valid uuid",
    "any.required": "accountId is required",
  }),

  name: Joi.string()
    .required()
    .custom((value: string, helpers) => {
      const normalizedValue = value.trim();

      if (!normalizedValue) {
        return helpers.message({
          custom: "Введите название счета",
        });
      }

      if (normalizedValue.length < 3) {
        return helpers.message({
          custom: "Минимум 3 символа",
        });
      }

      if (normalizedValue.length > 25) {
        return helpers.message({
          custom: "Максимум 25 символов",
        });
      }

      if (/^\d+$/.test(normalizedValue)) {
        return helpers.message({
          custom: "Название не может состоять только из цифр",
        });
      }

      return normalizedValue;
    })
    .messages({
      "string.empty": "Введите название счета",
      "any.required": "Введите название счета",
    }),
});

export const correctAccountAmountSchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    "string.guid": "Account ID must be a valid UUID",
    "any.required": "Account ID is required",
  }),

  amount: Joi.string()
    .pattern(/^(0|[1-9]\d*)$/)
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
      "string.pattern.base": "Amount must be a non-negative integer string",
      "amount.max": "Amount is too large",
      "any.required": "Amount is required",
    }),
});
