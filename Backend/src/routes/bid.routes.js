const express = require('express');
const bidController = require('../controllers/bid.controller');
const validate = require('../middleware/validate');
const bidValidation = require('../validators/bid.validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Public (read-only)
router.get('/auction/:auctionId', validate(bidValidation.getBidsByAuction), bidController.getBidsByAuction);

// Protected
router.get('/user/:userId', auth, validate(bidValidation.getByUser), bidController.getBidsByUser);
router.post('/', auth, authorize('user', 'seller', 'admin'), validate(bidValidation.placeBid), bidController.placeBid);

module.exports = router;
