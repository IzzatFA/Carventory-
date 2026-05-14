const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validators/auth.validator');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
