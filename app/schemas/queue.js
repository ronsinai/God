const Joi = require('joi');

module.exports = Joi.object().keys({
  name: Joi.string().required(),
  options: Joi.object(),
});
