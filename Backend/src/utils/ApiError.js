class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, errors) {
    return new ApiError(400, msg || 'Bad Request', errors);
  }

  static unauthorized(msg) {
    return new ApiError(401, msg || 'Unauthorized');
  }

  static forbidden(msg) {
    return new ApiError(403, msg || 'Forbidden');
  }

  static notFound(msg) {
    return new ApiError(404, msg || 'Not Found');
  }

  static conflict(msg) {
    return new ApiError(409, msg || 'Conflict');
  }

  static internal(msg) {
    return new ApiError(500, msg || 'Internal Server Error');
  }
}

module.exports = ApiError;
