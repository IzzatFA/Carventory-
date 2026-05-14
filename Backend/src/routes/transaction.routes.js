const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const topupController = require('../controllers/topup.controller');
const buyNowController = require('../controllers/buyNow.controller');
const validate = require('../middleware/validate');
const transactionValidation = require('../validators/transaction.validator');
const topupValidation = require('../validators/topup.validator');
const buyNowValidation = require('../validators/buyNow.validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Topup routes — harus di atas /:id agar tidak terambil sebagai param
router.post('/topup', auth, validate(topupValidation.topUp), topupController.topUp);
router.get('/topup/balance', auth, topupController.getBalance);
router.get('/topup/history', auth, topupController.getHistory);

// Beli langsung
router.post('/buy-now', auth, validate(buyNowValidation.buyNow), buyNowController.buyNow);

// Riwayat transaksi milik user yang sedang login
router.get('/my', auth, validate(transactionValidation.getMyTransactions), transactionController.getMyTransactions);

// Admin only routes
router.get('/', auth, authorize('admin'), transactionController.getAllTransactions);
router.post('/', auth, authorize('admin'), validate(transactionValidation.create), transactionController.createTransaction);
router.patch('/:id/status', auth, authorize('admin'), validate(transactionValidation.updateStatus), transactionController.updateStatus);

// Protected routes — /:id paling bawah agar tidak "menelan" route di atas
router.get('/:id', auth, transactionController.getTransactionById);

module.exports = router;
