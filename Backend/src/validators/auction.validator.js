const Joi = require('joi');

const create = {
  body: Joi.object().keys({
    car_id: Joi.number().integer().required(),
    start_time: Joi.date().iso().required(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).required()
  })
};

const update = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    start_time: Joi.date().iso().optional(),
    end_time: Joi.date().iso().greater(Joi.ref('start_time')).optional()
  }).min(1)
};

const getById = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  })
};

const setWinner = {
  params: Joi.object().keys({
    id: Joi.number().integer().required()
  }),
  body: Joi.object().keys({
    winner_id: Joi.number().integer().required()
  })
};

module.exports = {
  create,
  update,
  getById,
  setWinner
};
