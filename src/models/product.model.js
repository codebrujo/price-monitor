const httpStatus = require('http-status');
const moment = require('moment');
const logger = require('../config/logger');
const APIError = require('../utils/APIError');

/**
 * User Schema
 */
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastTimeParsed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  Product.prototype.removeParseResults = async function () {
    const { SearchResult } = Product.sequelize.models;
    SearchResult.destroy({
      where: {
        ProductId: this.id,
      },
    });
  };

  Product.prototype.saveParseResults = async function (parseResults) {
    const { SearchResult } = Product.sequelize.models;
    await SearchResult.destroy({
      where: {
        ProductId: this.id,
      },
    });
    for (ind in parseResults) {
      SearchResult.create({
        ProductId: this.id,
        properties: parseResults[ind],
      });
    }
    console.log(parseResults);
    this.lastTimeParsed = moment().utc().format('YYYY-MM-DDTHH:mm:ssZ');
    //this.save();
  };

  /**
   * Returns Product's list
   *
   * @param   {options} options    filter options
   * @returns {[Product]}
   */
  Product.list = async (options) => {
    return Product.findAll(options);
  };

  Product.associate = (models) => {
    Product.hasMany(models.SearchResult);
    Product.hasMany(models.SearchResult);
  };

  return Product;
};
