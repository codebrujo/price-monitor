'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('SearchStrings', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        searchString: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        updatedAt: Sequelize.DATE,
        createdAt: Sequelize.DATE,
      })
      .then(() =>
        queryInterface.addConstraint('SearchStrings', {
          fields: ['ProductId'],
          type: 'FOREIGN KEY',
          name: 'FK_SearchString_Product',
          references: {
            table: 'Products',
            field: 'id',
          },
          onDelete: 'cascade',
          onUpdate: 'no action',
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface
      .removeConstraint('SearchStrings', 'FK_SearchString_Product')
      .then(() => queryInterface.dropTable('SearchStrings'));
  },
};
