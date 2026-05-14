const topupService = require('../services/topup.service');
const ApiResponse = require('../utils/ApiResponse');

const topupController = {
  async topUp(req, res, next) {
    try {
      const { amount } = req.body;
      const result = await topupService.topUp(req.user.id, amount);
      return ApiResponse.created(res, 'Top up berhasil dikonfirmasi', result);
    } catch (error) {
      next(error);
    }
  },

  async getBalance(req, res, next) {
    try {
      const data = await topupService.getBalance(req.user.id);
      return ApiResponse.success(res, 'Saldo berhasil diambil', data);
    } catch (error) {
      next(error);
    }
  },

  async getHistory(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { history, meta } = await topupService.getHistory(req.user.id, page, limit);
      return ApiResponse.success(res, 'Riwayat top up berhasil diambil', history, meta);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = topupController;
