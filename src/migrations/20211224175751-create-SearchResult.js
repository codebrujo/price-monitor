'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('SearchResults', {
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
        properties: {
          type: Sequelize.JSON,
          allowNull: false,
        },
        updatedAt: Sequelize.DATE,
        createdAt: Sequelize.DATE,
      })
      .then(() =>
        queryInterface.addConstraint('SearchResults', {
          fields: ['ProductId'],
          type: 'FOREIGN KEY',
          name: 'FK_SearchResult_Product',
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
      .removeConstraint('SearchResults', 'FK_SearchResult_Product')
      .then(() => queryInterface.dropTable('SearchResults'));
  },
};
