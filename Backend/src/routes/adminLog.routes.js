const express = require('express');
const adminLogController = require('../controllers/adminLog.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Admin only
router.get('/', auth, authorize('admin'), adminLogController.getLogs);

module.exports = router;
