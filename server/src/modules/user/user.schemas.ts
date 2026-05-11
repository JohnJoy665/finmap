import Joi from "joi";

export const userMeschema = Joi.object({
  id: Joi.string().min(2).max(50).required(),
});