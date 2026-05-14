const buyNowService = require('../services/buyNow.service');
const ApiResponse = require('../utils/ApiResponse');

const buyNowController = {
  async buyNow(req, res, next) {
    try {
      const { car_id } = req.body;
      const result = await buyNowService.buyNow(req.user.id, car_id);
      return ApiResponse.created(res, 'Pembelian berhasil', result);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = buyNowController;
