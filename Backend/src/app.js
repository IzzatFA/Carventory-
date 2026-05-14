const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    stream: { write: message => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('combined', {
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CarVentory API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
