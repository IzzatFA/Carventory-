const auctionService = require('../services/auction.service');
const ApiResponse = require('../utils/ApiResponse');

const auctionController = {
  async createAuction(req, res, next) {
    try {
      const auction = await auctionService.createAuction(req.body, req.user.id);
      return ApiResponse.created(res, 'Auction created successfully', auction);
    } catch (error) {
      next(error);
    }
  },

  async getAllAuctions(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const { auctions, meta } = await auctionService.getAllAuctions(status, page, limit);
      return ApiResponse.success(res, 'Auctions retrieved successfully', auctions, meta);
    } catch (error) {
      next(error);
    }
  },

  async getAuctionById(req, res, next) {
    try {
      const { id } = req.params;
      const auction = await auctionService.getAuctionById(id);
      return ApiResponse.success(res, 'Auction retrieved successfully', auction);
    } catch (error) {
      next(error);
    }
  },

  async updateAuction(req, res, next) {
    try {
      const { id } = req.params;
      const auction = await auctionService.updateAuction(id, req.body, req.user.id);
      return ApiResponse.success(res, 'Auction updated successfully', auction);
    } catch (error) {
      next(error);
    }
  },

  async deleteAuction(req, res, next) {
    try {
      const { id } = req.params;
      await auctionService.deleteAuction(id, req.user.id);
      return ApiResponse.success(res, 'Auction deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async setWinner(req, res, next) {
    try {
      const { id } = req.params;
      const { winner_id } = req.body;
      const auction = await auctionService.setWinner(id, winner_id, req.user.id);
      return ApiResponse.success(res, 'Auction winner set successfully', auction);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = auctionController;
