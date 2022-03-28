const httpStatus = require('http-status');
const db = require('../../models');
const logger = require('../../config/logger');
const APIError = require('../../utils/APIError');

const service = require('../../services/product.service');

const { UserProduct } = db;

const { checkIntId } = require('../../utils/helpers');

function getModuleError(initError, message, fnName, res, status, stack) {
  const source = `${fnName}.product.controller`;
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
 * Load Product record and append to req.locals as product.
 * @public
 */
async function loadProduct(req, res, next, productId) {
  if (!checkIntId(productId)) {
    return next(
      getModuleError(
        null,
        'Validation error: incorrect productId',
        arguments.callee.name,
        res,
        httpStatus.BAD_REQUEST
      )
    );
  }
  let record;
  try {
    record = await UserProduct.findOne({
      where: {
        id: productId,
      },
    });
    if (!record) {
      throw getModuleError(
        null,
        `Product id is not exist`,
        arguments.callee.name,
        res,
        httpStatus.NOT_FOUND,
        `ID: ${productId}`
      );
    }
  } catch (error) {
    e = getModuleError(
      error,
      'Product is not found',
      arguments.callee.name,
      res,
      httpStatus.NOT_FOUND
    );
    logger.error(e);
    return next(e);
  }
  req.locals = { ...req.locals, product: record };
  return next();
}

exports.loadProduct = loadProduct;

/**
 * Get Product
 * @public
 */
exports.get = async (req, res, next) => {
  res.json(await service.getProduct(req.locals.product, req.user));
};

exports.getProducts = async (req, res, next) => {
  res.json(await service.listProducts(req.user));
};

exports.createProduct = async (req, res, next) => {
  try {
    res.json(await service.createProduct(req.user, req.body));
  } catch (error) {
    return next(getModuleError(error, error.message, 'createProduct', res, httpStatus.BAD_REQUEST));
  }
};

exports.patchProduct = async (req, res, next) => {
  res.json(await service.updateProduct(req.locals.product, req.body));
};

exports.deleteProduct = async (req, res, next) => {
  service.deleteProduct(req.locals.product);
  res.status(httpStatus.NO_CONTENT).end();
};
