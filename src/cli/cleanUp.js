const Sequelize = require("sequelize");
const { pgConfig } = require('../config/constants');

const sequelizeOptions = {
  dialect: "postgres",
  port: pgConfig.port,
  host: pgConfig.host,
  pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
   },
  logging: false,
};

const sequelize = new Sequelize(
  pgConfig.db,
  pgConfig.user,
  pgConfig.passwd,
  sequelizeOptions
);

const runCleanup = async () => {
  await sequelize.query(`DROP VIEW IF EXISTS "EventSummaries";
  DROP TABLE IF EXISTS "UserDeviceEvents";`,
    {
      type: Sequelize.QueryTypes.RAW,
    }
  );
  sequelize.close();
}

runCleanup();