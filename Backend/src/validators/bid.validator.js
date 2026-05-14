const Joi = require('joi');

const placeBid = {
  body: Joi.object().keys({
    auction_id: Joi.number().integer().required(),
    bid_amount: Joi.number().positive().required()
  })
};

const getBidsByAuction = {
  params: Joi.object().keys({
    auctionId: Joi.number().integer().required()
  })
};

const getByUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required()
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20)
  })
};

module.exports = {
  placeBid,
  getBidsByAuction,
  getByUser
};
