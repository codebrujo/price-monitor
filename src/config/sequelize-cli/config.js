const fs = require('fs');
const path = require('path');

const filename = path.resolve(
  __dirname,
  'config.json'
);

let localConfig = null;

const getLocalConfig = () => {
  if (!localConfig && fs.existsSync(filename)) {
    try {
      localConfig = JSON.parse(fs.readFileSync(filename));
    } catch (error) {
      console.error(error.message);
    }
  }
  return localConfig;
}


module.exports = {
  development: {
    username: getLocalConfig()
      ? getLocalConfig()['development'].username
      : process.env.POSTGRES_USER,
    password: getLocalConfig()
      ? getLocalConfig()['development'].password
      : process.env.POSTGRES_PASSWORD,
    database: getLocalConfig()
      ? getLocalConfig()['development'].database
      : process.env.POSTGRES_DB,
    host: getLocalConfig()
      ? getLocalConfig()['development'].host
      : process.env.POSTGRES_HOST,
    port: getLocalConfig()
      ? getLocalConfig()['development'].port
      : process.env.POSTGRES_PORT,
    dialect: 'postgres',
  },
  test: {
    username: getLocalConfig()
      ? getLocalConfig()['test'].username
      : process.env.POSTGRES_USER,
    password: getLocalConfig()
      ? getLocalConfig()['test'].password
      : process.env.POSTGRES_PASSWORD,
    database: getLocalConfig()
      ? getLocalConfig()['test'].database
      : process.env.POSTGRES_DB,
    host: getLocalConfig()
      ? getLocalConfig()['test'].host
      : process.env.POSTGRES_HOST,
    port: getLocalConfig()
      ? getLocalConfig()['test'].port
      : process.env.POSTGRES_PORT,
    dialect: 'postgres',
  },
  production: {
    username: getLocalConfig()
      ? getLocalConfig()['production'].username
      : process.env.POSTGRES_USER,
    password: getLocalConfig()
      ? getLocalConfig()['production'].password
      : process.env.POSTGRES_PASSWORD,
    database: getLocalConfig()
      ? getLocalConfig()['production'].database
      : process.env.POSTGRES_DB,
    host: getLocalConfig()
      ? getLocalConfig()['production'].host
      : process.env.POSTGRES_HOST,
    port: getLocalConfig()
      ? getLocalConfig()['production'].port
      : process.env.POSTGRES_PORT,
    dialect: 'postgres',
  },
};
