const httpStatus = require('http-status');
const { updateModel } = require('../utils/helpers');

const db = require('../models');
const logger = require('../config/logger');
const APIError = require('../utils/APIError');
const { UserProduct, Product, SearchString, SearchResult } = db;

exports.listProducts = async () => {
  return [];
};

const getProductBySearchString = async (searchString, properties = {}) => {
  const searchStringItem = await SearchString.findOne({
    where: {
      searchString,
    },
    include: [
      {
        model: Product,
        required: true,
      },
    ],
  });

  if (searchStringItem) return searchStringItem.Product;
  let product = await Product.findOne({
    where: {
      name: searchString,
    },
  });
  if (product) return product;
  product = await Product.create({
    isActive: true,
    name: searchString,
    properties,
  });
  return product;
};

exports.getProduct = async ({ id }, { id: UserId }) => {
  const product = await UserProduct.findOne({
    attributes: ['id', 'externalId', 'properties'],
    where: {
      id,
      UserId,
    },
    include: [
      {
        model: Product,
        required: true,
        include: [
          {
            model: SearchResult,
            required: false,
          },
          {
            model: SearchString,
            required: false,
          },
        ],
      },
    ],
  });
  return product;
};

exports.listProducts = async ({ id: UserId }) => {
  return await UserProduct.findAll({
    attributes: ['id', 'externalId', 'properties'],
    where: {
      UserId,
    },
    include: [
      {
        model: Product,
        required: true,
      },
    ],
  });
};

exports.createProduct = async (
  user,
  { externalId, properties, searchStrings }
) => {
  if (!externalId || !searchStrings) {
    throw new APIError(
      `createProduct: missing body params ${externalId} ${searchStrings}`
    );
  }
  if (!Array.isArray(searchStrings) || searchStrings.length === 0) {
    throw new APIError('createProduct: search strings are not defined');
  }
  const searchString = searchStrings[0];
  let userProduct = await UserProduct.findOne({
    where: {
      externalId,
    },
    include: [
      {
        model: Product,
        required: true,
      },
    ],
  });
  let product = null;
  if (userProduct) {
    product = userProduct.Product;
  } else {
    product = await getProductBySearchString(searchString, properties);
    userProduct = await UserProduct.create({
      ProductId: product.id,
      UserId: user.id,
      externalId,
      properties,
    });
  }
  await SearchString.destroy({
    where: {
      ProductId: product.id,
    },
  });
  product.dataValues['SearchResult'] = await SearchResult.findAll({
    where: {
      ProductId: product.id,
    },
  });
  product.dataValues['SearchString'] = [];
  for (ind in searchStrings) {
    product.dataValues.SearchString.push(
      await SearchString.create({
        ProductId: product.id,
        searchString: searchStrings[ind],
      })
    );
  }
  userProduct.dataValues['Product'] = product;
  return userProduct;
};

exports.updateProduct = async (
  userProduct,
  { name, isActive, externalId, properties, searchStrings }
) => {
  const product = await Product.findByPk(userProduct.ProductId);
  if (typeof name !== 'undefined') {
    product.name = name;
  }
  if (typeof isActive !== 'undefined') {
    product.isActive = isActive;
  }
  if (typeof properties !== 'undefined') {
    product.properties = {
      ...properties,
    };
    userProduct.properties = {
      ...properties,
    };
  }
  if (typeof externalId !== 'undefined') {
    userProduct.externalId = externalId;
  }
  if (
    typeof name !== 'undefined' ||
    typeof isActive !== 'undefined' ||
    typeof properties !== 'undefined'
  ) {
    await product.save();
  }
  if (typeof externalId !== 'undefined' || typeof properties !== 'undefined') {
    await userProduct.save();
  }
  product.dataValues['SearchResult'] = await SearchResult.findAll({
    where: {
      ProductId: product.id,
    },
  });
  product.dataValues['SearchString'] = await SearchString.findAll({
    where: {
      ProductId: product.id,
    },
  });
  if (typeof searchStrings !== 'undefined') {
    await SearchString.destroy({
      where: {
        ProductId: product.id,
      },
    });
    product.dataValues['SearchString'] = [];
    if (Array.isArray(searchStrings)) {
      for (ind in searchStrings) {
        product.dataValues.SearchString.push(
          await SearchString.create({
            ProductId: product.id,
            searchString: searchStrings[ind],
          })
        );
      }
    }
  }
  userProduct.dataValues['Product'] = product;
  return userProduct;
  // return await updateModel(User, user, body, ['id', 'updatedAt', 'createdAt']);
};

exports.deleteProduct = async (product) => {
  await product.destroy();
  await Product.destroy({
    where: {
      id: product.ProductId,
    },
  });
}