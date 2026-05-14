const Joi = require('joi');

const topUp = {
  body: Joi.object().keys({
    amount: Joi.number().positive().min(10000).max(100000000).required()
      .messages({
        'number.min': 'Minimum top up adalah Rp 10.000',
        'number.max': 'Maximum top up adalah Rp 100.000.000 per transaksi'
      })
  })
};

module.exports = { topUp };
