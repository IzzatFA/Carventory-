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

const getMyTransactions = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
    type: Joi.string().valid('topup', 'auction_payment', 'buy_now', 'refund').optional()
  })
};

module.exports = {
  create,
  updateStatus,
  getMyTransactions
};
