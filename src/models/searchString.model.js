/**
 * User Schema
 */
module.exports = (sequelize, DataTypes) => {
  const SearchString = sequelize.define('SearchString', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    ProductId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    searchString: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  /**
   * Returns SearchString's list
   *
   * @param   {options} options    filter options
   * @returns {[SearchString]}
   */
  SearchString.list = async (options) => {
    return SearchString.findAll(options);
  };

  SearchString.associate = (models) => {
    SearchString.belongsTo(models.Product);
  };

  return SearchString;
};
