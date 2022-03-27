'use strict';

// npx sequelize migration:generate --name create-Shop
// npx sequelize-cli db:migrate:undo
// npx sequelize-cli db:migrate:undo:all --to 20210618082806-create-Shop.js

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.createTable('Users', {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          role: {
            type: Sequelize.STRING(1024),
            allowNull: false,
          },
          authToken: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          properties: {
            type: Sequelize.JSON,
            allowNull: true,
          },
          updatedAt: Sequelize.DATE,
          createdAt: Sequelize.DATE,
        });
    },
    down: async(queryInterface, Sequelize) => {
        queryInterface.dropTable('Users');
    }
};