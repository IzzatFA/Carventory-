const express = require('express');
const auctionController = require('../controllers/auction.controller');
const validate = require('../middleware/validate');
const auctionValidation = require('../validators/auction.validator');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const router = express.Router();

// Public routes
router.get('/', auctionController.getAllAuctions);
router.get('/:id', validate(auctionValidation.getById), auctionController.getAuctionById);

// Admin only routes
router.post('/', auth, authorize('admin'), validate(auctionValidation.create), auctionController.createAuction);
router.put('/:id', auth, authorize('admin'), validate(auctionValidation.update), auctionController.updateAuction);
router.delete('/:id', auth, authorize('admin'), validate(auctionValidation.getById), auctionController.deleteAuction);
router.patch('/:id/winner', auth, authorize('admin'), validate(auctionValidation.setWinner), auctionController.setWinner);

module.exports = router;
