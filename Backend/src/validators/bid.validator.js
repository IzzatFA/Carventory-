const Joi = require('joi');

const placeBid = {
  body: Joi.object().keys({
    auction_id: Joi.number().integer().required(),
    bid_ammount: Joi.number().positive().required()
  })
};

const getBidsByAuction = {
  params: Joi.object().keys({
    auctionId: Joi.number().integer().required()
  })
};

module.exports = {
  placeBid,
  getBidsByAuction
};
