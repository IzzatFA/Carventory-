const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware
 * @param {Object} schema - Joi schema object
 */
const validate = (schema) => {
  return (req, res, next) => {
    // Collect data to validate based on schema keys
    const validSchema = {};
    const objectToValidate = {};

    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = schema[key];
        objectToValidate[key] = req[key];
      }
    });

    const joiSchema = require('joi').object(validSchema);
    
    const { value, error } = joiSchema.validate(objectToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return next(ApiError.badRequest('Validation failed', errors));
    }

    Object.assign(req, value);
    return next();
  };
};

module.exports = validate;
