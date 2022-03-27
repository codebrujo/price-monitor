const Sequelize = require("sequelize");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const { env, pgConfig } = require("../config/constants");
const logger = require("../config/logger");
const APIError = require("../utils/APIError");

const db = {};

// connect to postgres Db
const sequelizeOptions = {
  dialect: "postgres",
  port: pgConfig.port,
  host: pgConfig.host,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
};
const sequelize = new Sequelize(
  pgConfig.db,
  pgConfig.user,
  pgConfig.passwd,
  sequelizeOptions
);

const modelsDir = path.normalize(`${__dirname}`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
  .filter(
    (file) =>
      file.indexOf(".") !== 0 &&
      file.indexOf(".map") === -1 &&
      file !== "index.js"
  )
  // import model files and save model names
  .forEach((file) => {
    logger.info(`Loading model file ${file}`);
    const model = require(path.join(modelsDir, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((model) => {
  if (db[model].associate) {
    db[model].associate(db);
  }
});

sequelize
  .authenticate()
  .then(() => {
    logger.info(`Connected to '${pgConfig.db}' database`);
  })
  .catch((err) => {
    logger.error(`Unable to connect to '${pgConfig.db}' database`, err);
    throw new APIError({
      message: `Unable to connect to '${pgConfig.db}' database`,
      source: 'index.model',
    });
  });

// assign the sequelize variables to the db object
const models = _.extend(
  {
    sequelize,
    Sequelize,
  },
  db
);

logger.info('Initialize data');

Object.keys(db).forEach(model => {
  if (db[model].initializeData) {
    db[model].initializeData();
  }
});

module.exports = models;
