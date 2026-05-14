const express = require('express');
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Current user — harus di atas /:id agar tidak dianggap sebagai param
router.get('/me', auth, userController.getMe);

// Admin only routes
router.get('/', auth, authorize('admin'), userController.getAllUsers);
router.delete('/:id', auth, authorize('admin'), userController.deleteUser);

// User/Admin routes
router.get('/:id', auth, userController.getUserById);

module.exports = router;
