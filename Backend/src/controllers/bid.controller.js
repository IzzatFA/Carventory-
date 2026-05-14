const bidService = require('../services/bid.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const bidController = {
  async placeBid(req, res, next) {
    try {
      const { auction_id, bid_amount } = req.body;
      const bid = await bidService.placeBid(req.user.id, auction_id, bid_amount);
      return ApiResponse.created(res, 'Bid placed successfully', bid);
    } catch (error) {
      next(error);
    }
  },

  async getBidsByAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const bids = await bidService.getBidsByAuction(auctionId);
      return ApiResponse.success(res, 'Bids retrieved successfully', bids);
    } catch (error) {
      next(error);
    }
  },

  async getBidsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return next(ApiError.forbidden('You can only access your own bids'));
      }

      const { page, limit } = req.query;
      const { bids, meta } = await bidService.getBidsByUser(userId, page, limit);
      return ApiResponse.success(res, 'User bids retrieved successfully', bids, meta);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bidController;
