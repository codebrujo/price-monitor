const httpStatus = require('http-status');

const { getUserAuthStatus } = require('../services/user.service');
const logger = require('../config/logger');
const APIError = require('../utils/APIError');

const db = require('../models');
const { User } = db;

const ADMIN = 'admin';
const LOGGED_USER = '_loggedUser';

exports.ADMIN = ADMIN;
exports.LOGGED_USER = LOGGED_USER;

function getModuleError(initError, message, fnName, res, status, stack) {
  const source = `${fnName}.auth.middleware`;
  const traceId = res.locals.traceId;
  const e = new APIError({
    message,
    status,
    stack,
    source,
    traceId,
  });
  e.combineProps(initError);
  return e;
}

exports.checkRole = (role) => {
  return (req, res, next) => {
    const { user } = req;
    const userRole = user ? user.role : null;
    if (role) {
      if (!userRole) {
        return next(
          getModuleError(
            null,
            'Unathorized',
            'checkRole',
            res,
            httpStatus.UNAUTHORIZED
          )
        );
      }
      if (role === LOGGED_USER || role === userRole) {
        // only logged user can access the data
        return next();
      }
      if (role === ADMIN) {
        // only admin can access the data
        if (!user.isAdmin()) {
          return next(
            getModuleError(
              null,
              'No rights to process the request',
              'checkRole',
              res,
              httpStatus.FORBIDDEN
            )
          );
        }
      }
    }
    // any user can access the data
    return next();
  };
};

exports.authorize = async (req, res, next) => {
  const authToken = (req.header('Authorization') || '').replace('Bearer ', '');
  try {
    if (!authToken)
      throw getModuleError(
        null,
        'Empty token',
        'authorize',
        res,
        httpStatus.UNAUTHORIZED
      );
    const user = await User.findOne({
      where: {
        authToken,
      },
    });
    if (!user)
      throw getModuleError(
        null,
        'No user found',
        'authorize',
        res,
        httpStatus.UNAUTHORIZED
      );
    req.user = user;
    return next();
  } catch (error) {
    logger.error(error);
    res.status(httpStatus.UNAUTHORIZED).end();
    return;
  }
};
