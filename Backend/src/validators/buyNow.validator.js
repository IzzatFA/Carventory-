const Joi = require('joi');

const buyNow = {
  body: Joi.object().keys({
    car_id: Joi.number().integer().required()
  })
};

module.exports = { buyNow };
