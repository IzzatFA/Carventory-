const http = require('http');
const app = require('./src/app');
const env = require('./src/config/env');
const logger = require('./src/utils/logger');
const { initWebSocket } = require('./src/websocket');

const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

const PORT = env.PORT || 6767;

server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
