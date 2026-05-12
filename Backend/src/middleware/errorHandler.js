const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], false);
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (error.statusCode === 500) {
    logger.error(`${err.message} \n ${err.stack}`);
  } else {
    logger.debug(`${error.statusCode} - ${error.message}`);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
