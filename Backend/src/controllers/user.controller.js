const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');

const userController = {
  async getMe(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id);
      return ApiResponse.success(res, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  async getAllUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { users, meta } = await userService.getAllUsers(page, limit);
      return ApiResponse.success(res, 'Users retrieved successfully', users, meta);
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return ApiResponse.success(res, 'User retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      return ApiResponse.success(res, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
