import Joi from "joi";

export const createGroupSchema = Joi.object({
  groupName: Joi.string().min(2).max(25).required(),
  categoryId: Joi.number().integer().positive().required(),
  amount: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .max(100)
    .required(),
  conversionFactor: Joi.number().integer().min(1).max(1000).required(),
  currencyCode: Joi.string().length(3).uppercase().required(),
  accountId: Joi.string().uuid().required(),
});
