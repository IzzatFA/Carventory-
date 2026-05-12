const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware
 * @param  {...String} roles - Allowed roles (e.g., 'admin', 'seller')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }

    next();
  };
};

module.exports = authorize;
