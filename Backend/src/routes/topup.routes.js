const express = require('express');
const topupController = require('../controllers/topup.controller');
const validate = require('../middleware/validate');
const topupValidation = require('../validators/topup.validator');
const auth = require('../middleware/auth');

const router = express.Router();

// Semua user yang sudah login dapat mengakses top up
router.get('/balance', auth, topupController.getBalance);
router.get('/history', auth, topupController.getHistory);
router.post('/', auth, validate(topupValidation.topUp), topupController.topUp);

module.exports = router;
