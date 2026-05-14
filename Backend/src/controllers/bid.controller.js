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
      // Normal users can only see their own bids; admins can see any user's bids
      if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
        return next(ApiError.forbidden('You can only access your own bids'));
      }
      
      const bids = await bidService.getBidsByUser(userId);
      return ApiResponse.success(res, 'User bids retrieved successfully', bids);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = bidController;
