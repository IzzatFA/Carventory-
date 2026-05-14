const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const authController = {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      return ApiResponse.created(res, 'User registered successfully', user);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login(email, password);
      return ApiResponse.success(res, 'Login successful', data);
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      return ApiResponse.success(res, 'User profile retrieved successfully', req.user);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
