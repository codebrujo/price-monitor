const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const readline = require('readline');
const { env } = require('../config/constants');
const filename = path.resolve(__dirname, '..', 'config', 'sequelize-cli', 'config.json');

if (!fs.existsSync(filename)) {
  return;
}

const pgConfig = JSON.parse(fs.readFileSync(filename))[env];
const client = new Client({
  host: pgConfig.host,
  port: pgConfig.port,
  user: pgConfig.username,
  password: pgConfig.password,
});

console.error(`Drop and create database ${pgConfig.database}`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "This will DESTROY all user's data. Type 'I agree' to continue.> "
});

const processInit = () => {
  client.connect(err => {
    if (err) {
      console.error('Connection error', err.stack)
    }
  })

}

client.on('connect', err => {
  if (!err) {
    client
      .query(`SELECT 1 AS result FROM pg_database WHERE datname = '${pgConfig.database}'`)
      .then(res => {
        if (!res.rowCount) {
          client
            .query(`CREATE DATABASE ${pgConfig.database}`)
            .then(res => {
              console.log(`Database ${pgConfig.database} created`)
              client.end();
            });
        } else {
          client
            .query(`DROP DATABASE ${pgConfig.database}`)
            .then(res => {
              client
                .query(`CREATE DATABASE ${pgConfig.database}`)
                .then(res => {
                  console.log(`Database ${pgConfig.database} re-created`)
                  client.end();
                });
            }).catch(err => {
              console.log(err);
              client.end();
            });
        }
      })
      .catch(e => {
        console.error(e.stack)
      })
  }
})

client.on('end', err => {
  process.exit();
})

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'I agree':
      processInit();
      break;
    default:
      console.log('exitting...');
      rl.close();
      break;
  }
}).on('close', () => {
  process.exit(0);
});