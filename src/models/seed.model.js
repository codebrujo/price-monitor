/**
 * Seed Schema
 */
module.exports = (sequelize, DataTypes) => {
  const Seed = sequelize.define('Seed', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  return Seed;
};
