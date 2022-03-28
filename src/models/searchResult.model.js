/**
 * User Schema
 */
module.exports = (sequelize, DataTypes) => {
  const SearchResult = sequelize.define('SearchResult', {
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
    source: {
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
   * @returns {[SearchResult]}
   */
  SearchResult.list = async (options) => {
    return SearchResult.findAll(options);
  };

  SearchResult.associate = (models) => {
    SearchResult.belongsTo(models.Product);
  };

  return SearchResult;
};
