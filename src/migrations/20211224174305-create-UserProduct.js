'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .createTable('UserProducts', {
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
        UserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        externalId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        properties: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        updatedAt: Sequelize.DATE,
        createdAt: Sequelize.DATE,
      })
      .then(() =>
        queryInterface.addConstraint('UserProducts', {
          fields: ['ProductId'],
          type: 'FOREIGN KEY',
          name: 'FK_UserProduct_Product',
          references: {
            table: 'Products',
            field: 'id',
          },
          onDelete: 'cascade',
          onUpdate: 'no action',
        })
      )
      .then(() =>
        queryInterface.addConstraint('UserProducts', {
          fields: ['UserId'],
          type: 'FOREIGN KEY',
          name: 'FK_UserProduct_User',
          references: {
            table: 'Users',
            field: 'id',
          },
          onDelete: 'cascade',
          onUpdate: 'no action',
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface
      .removeConstraint('UserProducts', 'FK_UserProduct_Product')
      .then(() => queryInterface.removeConstraint('FK_UserProduct_User'))
      .then(() => queryInterface.dropTable('UserProducts'));
  },
};
