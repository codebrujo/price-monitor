const httpStatus = require('http-status');
const db = require('../../models');
const logger = require('../../config/logger');
const APIError = require('../../utils/APIError');

const service = require('../../services/admin.service');

const {
  User,
} = db;

const { checkIntId } = require('../../utils/helpers');

function getModuleError(initError, message, fnName, res, status, stack) {
  const source = `${fnName}.admin.controller`;
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

/**
 * Load User record and append to req.locals as requestUser.
 * @public
 */
async function loadRequestUser(req, res, next, userId) {
  if (!checkIntId(userId)) {
    return next(
      getModuleError(
        null,
        'Validation error: incorrect user id',
        arguments.callee.name,
        res,
        httpStatus.BAD_REQUEST
      )
    );
  }
  let record;
  try {
    record = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!record) {
      throw getModuleError(
        null,
        `User id is not exist`,
        arguments.callee.name,
        res,
        httpStatus.NOT_FOUND,
        `ID: ${userId}`
      );
    }
  } catch (error) {
    e = getModuleError(
      error,
      'User is not found',
      arguments.callee.name,
      res,
      httpStatus.NOT_FOUND
    );
    logger.error(e);
    return next(e);
  }
  req.locals = { ...req.locals, requestUser: record };
  return next();
}

exports.loadRequestUser = loadRequestUser;

/**
 * Get Settings
 * @public
 */
exports.get = async (req, res, next) => {
  res.json(service.getSettings());
};

exports.getUsers = async (req, res, next) => {
  res.json(await service.listUsers());
};

exports.getUserDetails = async (req, res, next) => {
  res.json(await service.getUser(req.locals.requestUser));
};

exports.patchUser = async (req, res, next) => {
  res.json(await service.updateUser(req.locals.requestUser, req.body));
};

exports.me = async (req, res, next) => {
  res.json(req.user);
};
