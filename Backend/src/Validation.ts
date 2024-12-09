import Joi from 'joi';

export const waitlistValidationSchema = Joi.object({
  name: Joi.string().required(),
  country: Joi.string().required(),
  email: Joi.string().email().required(),
});