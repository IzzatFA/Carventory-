const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const validate = require('../middleware/validate');
const transactionValidation = require('../validators/transaction.validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Protected routes
router.get('/:id', auth, transactionController.getTransactionById);

// Admin only routes
router.get('/', auth, authorize('admin'), transactionController.getAllTransactions);
router.post('/', auth, authorize('admin'), validate(transactionValidation.create), transactionController.createTransaction);
router.patch('/:id/status', auth, authorize('admin'), validate(transactionValidation.updateStatus), transactionController.updateStatus);

module.exports = router;
