const httpStatus = require('http-status');
const logger = require('../config/logger');
const APIError = require('../utils/APIError');

/**
 * User Schema
 */
module.exports = (sequelize, DataTypes) => {
  const UserProduct = sequelize.define('UserProduct', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  /**
   * Returns SearchResult's list
   *
   * @param   {options} options    filter options
   * @returns {[UserProduct]}
   */
  UserProduct.list = async (options) => {
    return UserProduct.findAll(options);
  };

  UserProduct.associate = (models) => {
    UserProduct.belongsTo(models.Product);
    UserProduct.belongsTo(models.User);
  };

  return UserProduct;
};
