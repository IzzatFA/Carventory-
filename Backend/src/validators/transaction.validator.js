const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    auction_id: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending')
  })
};

const updateStatus = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required()
  })
};

module.exports = {
  create,
  updateStatus
};
