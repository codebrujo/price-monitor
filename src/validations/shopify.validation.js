const { Joi } = require('express-validation');

const emailCheckRegexp =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/im;

module.exports = {
  login: {
    body: Joi.object({
      email: Joi.string().regex(emailCheckRegexp).required(),
      password: Joi.string().max(60).required(),
    }),
  },
  register: {
    body: Joi.object({
      email: Joi.string().regex(emailCheckRegexp).required(),
      password: Joi.string().min(8).max(60).required(),
      firstName: Joi.string().allow(null, ''),
      lastName: Joi.string().allow(null, ''),
      acceptsMarketing: Joi.boolean(),
      phone: Joi.string()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im)
        .allow(null, ''),
    }),
  },
  subscribe: {
    body: Joi.object({
      productIds: Joi.array().items(Joi.number().integer()),
    }),
  },
  // POST v1/shopify/checkEmail
  checkEmail: {
    body: Joi.object({
      email: Joi.string().regex(emailCheckRegexp).required(),
    }),
  },
};
