const adminLogService = require('../services/adminLog.service');
const ApiResponse = require('../utils/ApiResponse');

const adminLogController = {
  async getLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { logs, meta } = await adminLogService.getLogs(page, limit);
      return ApiResponse.success(res, 'Logs retrieved successfully', logs, meta);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminLogController;
