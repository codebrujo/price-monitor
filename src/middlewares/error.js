const httpStatus = require('http-status');
const expressValidation = require('express-validation');
const APIError = require('../utils/APIError');
const { env } = require('../config/constants');
const logger = require('../config/logger');

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
const handler = (err, req, res, next) => {
  const response = {
    code: err.status,
    message: err.message || httpStatus[err.status],
    errors: err.errors,
    source: err.source,
    stack: err.stack,
  };

  if (env === 'production') {
    if (response.errors) {
      response.errors = response.errors.reduce((init, item) => {
        if (item.isPublic) {
          init.push({code: item.code, message: item.message});
        }
        return init;
      }, []);
    }
    delete response.source;
    delete response.stack;
  }
  res.status(err.status);
  res.json(response);
};
exports.handler = handler;

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
exports.converter = (err, req, res, next) => {
  let convertedError = err;
  if (err instanceof expressValidation.ValidationError) {
    convertedError = new APIError({
      message: 'Validation Error',
      errors: err.details,
      status: err.statusCode,
      stack: err.stack,
      source: 'validator',
    });
  } else if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
      source: err.source,
    });
  }
  logger.error(`${convertedError}`);
  return handler(convertedError, req, res);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
exports.notFound = (req, res, next) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND,
    source: 'error.middleware',
  });
  return handler(err, req, res);
};