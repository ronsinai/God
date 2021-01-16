const Joi = require('joi');

module.exports = Joi.object().keys({
  queue: Joi.string().required(),
  exchange: Joi.string().required(),
  patterns: Joi.string().allow('').required(),
});
