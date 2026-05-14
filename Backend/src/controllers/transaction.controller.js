const transactionService = require('../services/transaction.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const transactionController = {
  async createTransaction(req, res, next) {
    try {
      const transaction = await transactionService.createTransaction(req.body, req.user.id);
      return ApiResponse.created(res, 'Transaction created successfully', transaction);
    } catch (error) {
      next(error);
    }
  },

  async getAllTransactions(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { transactions, meta } = await transactionService.getAllTransactions(page, limit);
      return ApiResponse.success(res, 'Transactions retrieved successfully', transactions, meta);
    } catch (error) {
      next(error);
    }
  },

  async getTransactionById(req, res, next) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(id);
      
      // Ensure only admin or the winner can see this
      if (req.user.role !== 'admin' && transaction.auction?.winner_id !== req.user.id) {
        return next(ApiError.forbidden('You do not have permission to access this transaction'));
      }

      return ApiResponse.success(res, 'Transaction retrieved successfully', transaction);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;
      const transaction = await transactionService.updateStatus(id, payment_status, req.user.id);
      return ApiResponse.success(res, 'Transaction status updated successfully', transaction);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = transactionController;
