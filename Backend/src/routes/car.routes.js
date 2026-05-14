const express = require('express');
const carController = require('../controllers/car.controller');
const validate = require('../middleware/validate');
const carValidation = require('../validators/car.validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', carController.getAllCars);
router.get('/:id', validate(carValidation.getById), carController.getCarById);

// Protected routes (Seller / Admin)
router.post(
  '/', 
  auth, 
  authorize('seller', 'admin'), 
  upload.single('image'), 
  validate(carValidation.create), 
  carController.createCar
);

router.put(
  '/:id', 
  auth, 
  authorize('seller', 'admin'), 
  validate(carValidation.update), 
  carController.updateCar
);

router.delete(
  '/:id', 
  auth, 
  authorize('seller', 'admin'), 
  validate(carValidation.deleteCar), 
  carController.deleteCar
);

// Admin only
router.patch(
  '/:id/status', 
  auth, 
  authorize('admin'), 
  validate(carValidation.updateStatus), 
  carController.updateStatus
);

module.exports = router;
