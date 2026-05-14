const Joi = require('joi');

const currentYear = new Date().getFullYear();

const create = {
  body: Joi.object().keys({
    car_id: Joi.string().optional(), // optional custom ID
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(currentYear).required(),
    starting_price: Joi.number().positive().required(),
    buy_now_price: Joi.number().positive().allow(null).optional(),
    category: Joi.string().valid('penumpang', 'mewah', 'klasik').optional(),
    chassis_number: Joi.string().allow('', null).optional(),
    engine_number: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    location: Joi.string().allow('', null).optional(),
    is_verified: Joi.boolean().optional(),
    description: Joi.string().max(2000).optional(),
    status: Joi.string().valid('pending', 'active', 'sold').default('pending')
  })
};

const update = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    car_id: Joi.string().optional(),
    brand: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(currentYear).optional(),
    starting_price: Joi.number().positive().optional(),
    buy_now_price: Joi.number().positive().allow(null).optional(),
    category: Joi.string().valid('penumpang', 'mewah', 'klasik').optional(),
    chassis_number: Joi.string().allow('', null).optional(),
    engine_number: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    location: Joi.string().allow('', null).optional(),
    is_verified: Joi.boolean().optional(),
    description: Joi.string().max(2000).optional(),
    status: Joi.string().valid('pending', 'active', 'sold').optional()
  }).min(1) // Ensure at least one field is provided for update
};

const updateStatus = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'active', 'sold').required()
  })
};

const getById = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  })
};

const deleteCar = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  })
};

module.exports = {
  create,
  update,
  updateStatus,
  getById,
  deleteCar
};
