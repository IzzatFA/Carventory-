const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'seller', 'admin').default('user')
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

module.exports = {
  register,
  login
};
