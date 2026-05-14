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
  })
};

module.exports = {
  placeBid,
  getBidsByAuction,
  getByUser
};
