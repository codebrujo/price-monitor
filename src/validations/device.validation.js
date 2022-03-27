const { Joi } = require('express-validation');

module.exports = {
  // GET v1/devices/:userDeviceId
  getDevice: {
    params: Joi.object({
      userDeviceId: Joi.string()
        .regex(/^[0-9]{1,24}$/)
        .required(),
    }),
  },

  // POST v1/devices/:userDeviceId
  patchDevice: {
    body: Joi.object({
      packSize: Joi.number().min(0),
      orderThreshold: Joi.number().min(0),
      consumablesRemaining: Joi.number().min(0),
      isActive: Joi.bool(),
      address: Joi.string().allow(null, ''),
      id: Joi.number().allow(null),
      name: Joi.string().allow(null, ''),
      brand: Joi.string().allow(null, ''),
      vib: Joi.string().allow(null, ''),
      connected: Joi.bool().allow(null),
      type: Joi.string().allow(null, ''),
      enumber: Joi.string().allow(null, ''),
      haId: Joi.string().allow(null, ''),
      usedTotally: Joi.number().allow(null),
      subscription: Joi.object().allow(null),
      lastRunCycle: Joi.string().allow(null, ''),
      createdAt: Joi.string().allow(null, ''),
    }),
    params: Joi.object({
      userDeviceId: Joi.string()
        .regex(/^[0-9]*$/)
        .required(),
    }),
  },
};