const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const carRoutes = require('./car.routes');
const auctionRoutes = require('./auction.routes');
const bidRoutes = require('./bid.routes');
const transactionRoutes = require('./transaction.routes');
const adminLogRoutes = require('./adminLog.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/auctions', auctionRoutes);
router.use('/bids', bidRoutes);
router.use('/transactions', transactionRoutes);
router.use('/admin-logs', adminLogRoutes);

module.exports = router;
