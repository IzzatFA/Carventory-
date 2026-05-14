const carService = require('../services/car.service');
const storageService = require('../services/storage.service');
const ApiResponse = require('../utils/ApiResponse');

const carController = {
  async createCar(req, res, next) {
    try {
      // Handle file upload if present
      // Assume a middleware has already intercepted the file and stored it in req.file (Multer)
      let imageUrl = null;
      if (req.file) {
        imageUrl = await storageService.uploadImage(req.file, 'cars');
      }

      const carData = {
        ...req.body,
        ...(imageUrl && { description: req.body.description + `\nImage: ${imageUrl}` }) // Just saving the URL somewhere for now if no column exists, or alter DB to add image_url.
      };

      const car = await carService.createCar(carData, req.user.id);
      return ApiResponse.created(res, 'Car created successfully', car);
    } catch (error) {
      next(error);
    }
  },

  async getAllCars(req, res, next) {
    try {
      const { page, limit, brand, status, min_price, max_price } = req.query;
      const filters = { brand, status, min_price, max_price };

      const { cars, meta } = await carService.getAllCars(filters, page, limit);
      return ApiResponse.success(res, 'Cars retrieved successfully', cars, meta);
    } catch (error) {
      next(error);
    }
  },

  async getCarById(req, res, next) {
    try {
      const { id } = req.params;
      const car = await carService.getCarById(id);
      return ApiResponse.success(res, 'Car retrieved successfully', car);
    } catch (error) {
      next(error);
    }
  },

  async updateCar(req, res, next) {
    try {
      const { id } = req.params;
      const carData = req.body;
      const car = await carService.updateCar(id, carData, req.user.id, req.user.role);
      return ApiResponse.success(res, 'Car updated successfully', car);
    } catch (error) {
      next(error);
    }
  },

  async deleteCar(req, res, next) {
    try {
      const { id } = req.params;
      await carService.deleteCar(id, req.user.id, req.user.role);
      return ApiResponse.success(res, 'Car deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const car = await carService.updateStatus(id, status, req.user.id);
      return ApiResponse.success(res, 'Car status updated successfully', car);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = carController;
