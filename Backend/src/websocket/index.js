const { Server } = require('socket.io');
const env = require('../config/env');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

let io;

const initWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token.replace('Bearer ', ''), env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id} (socket: ${socket.id})`);

    socket.on('join_auction', (auctionId) => {
      socket.join(`auction_${auctionId}`);
      logger.debug(`User ${socket.user.id} joined auction ${auctionId}`);
    });

    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction_${auctionId}`);
      logger.debug(`User ${socket.user.id} left auction ${auctionId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

// Emit new bid to a specific auction room
const emitNewBid = (auctionId, bidData) => {
  if (io) {
    io.to(`auction_${auctionId}`).emit('new_bid', bidData);
  }
};

module.exports = { initWebSocket, getIo, emitNewBid };
