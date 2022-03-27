const httpStatus = require('http-status');

/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor({
    message,
    errors,
    status,
    isPublic,
    stack,
    traceId,
  }) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.errors = errors;
    this.status = status;
    this.isPublic = isPublic;
    this.isOperational = true;
    this.stack = stack;
    this.traceId = traceId;
    // Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * Class representing an API error.
 * @extends ExtendableError
 */
class APIError extends ExtendableError {
  /**
  * Creates an API error.
  * @param {string} message - Error message.
  * @param {number} status - HTTP status code of error.
  * @param {boolean} isPublic - Whether the message should be visible to user or not.
  */
  constructor({
    message,
    errors,
    stack,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
    source,
    traceId,
  }) {
    super({
      message,
      errors,
      status,
      isPublic,
      stack,
      traceId,
    });
    this.source = source;
  }
  combineProps(initError) {
    if (initError) {
      if (initError instanceof APIError) {
        this.message = this.message ? this.message : initError.message;
        this.stack = this.stack ? this.stack : initError.message + (initError.stack ? ': ' + initError.stack : '');
      }
      if (!this.errors) {
        this.errors = [];
      }
      this.errors.push(initError);
    };
  }
}

/*global module*/
/*eslint no-undef: ["error", { "typeof": true }] */
module.exports = APIError;