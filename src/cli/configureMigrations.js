const fs = require('fs');
const path = require('path');

const filename = path.resolve(
  __dirname,
  '..',
  'config',
  'sequelize-cli',
  'config.json'
);

if (fs.existsSync(filename)) {
  fs.unlinkSync(filename);
}

if (process.env.POSTGRES_HOST) {
  console.log(
    'Configure migrations: settings are handled by environment variables. Skip localConfig creation.'
  );
  return;
}

const { pgConfig } = require('../config/constants');

const pgPasswd = pgConfig.passwd ? `"${pgConfig.passwd}"` : 'null';

fs.writeFileSync(
  filename,
  `{
    "development": {
      "username": "${pgConfig.user}",
      "password": ${pgPasswd},
      "database": "${pgConfig.db}",
      "host": "${pgConfig.host}",
      "port": "${pgConfig.port}",
      "dialect": "postgres"
    },
    "test": {
      "username": "${pgConfig.user}",
      "password": ${pgPasswd},
      "database": "${pgConfig.db}",
      "host": "${pgConfig.host}",
      "port": "${pgConfig.port}",
      "dialect": "postgres"
    },
    "production": {
      "username": "${pgConfig.user}",
      "password": ${pgPasswd},
      "database": "${pgConfig.db}",
      "host": "${pgConfig.host}",
      "port": "${pgConfig.port}",
      "dialect": "postgres"
  }
}`
);
