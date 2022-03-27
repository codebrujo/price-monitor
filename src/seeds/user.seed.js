const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const db = require('../models');
const { User, Seed } = db;
const { env } = require('../config/constants');

const SEED_NAME = 'user';

exports.sequenceOrder = 100;

const upsertRecord = async (data) => {
  const res = {
    applied: false,
    error: null,
  };
  const { name, role, authToken, properties } = data;
  try {
    const [element, created] = await User.findOrCreate({
      where: {
        authToken,
      },
      defaults: {
        ...data,
      },
    });
    if (!created) {
      element.name = name;
      element.role = role;
      element.properties = {
        ...element.properties,
        ...properties,
      };
      element.save();
      logger.info(`User ${name} updated`);
    } else {
      logger.info(`User ${name} created`);
    }
    res.applied = true;
  } catch (error) {
    res.error = error.message;
  }
  return res;
};

const seedData = async (fileName) => {
  let data;
  try {
    data = fs.readFileSync(
      path.normalize(`${__dirname}/data/${fileName}.json`)
    );
  } catch (error) {
    logger.info(`Seed file ${fileName}.json is not found. Seeding skipped.`);
    return;
  }
  try {
    const json = JSON.parse(data);

    let latestVersion = await Seed.max('version', {
      where: {
        name: SEED_NAME,
      },
    });
    latestVersion = latestVersion ? latestVersion : 0;
    if (latestVersion >= json.version) {
      logger.info(
        `Seed ${SEED_NAME}: latest version is already applied. Seeding skipped.`
      );
      return;
    }
    const creationResult = await Promise.all(
      json.items.map((element) => {
        return upsertRecord(element);
      })
    );
    if (creationResult.some((item) => item.applied)) {
      const properties = {
        errors: creationResult.reduce((init, item) => {
          if (item.error) {
            init = `${init}${item.error};`;
          }
          return init;
        }, ''),
      };
      Seed.create({
        name: SEED_NAME,
        version: json.version,
        properties,
      });
    }
  } catch (error) {
    logger.error(`Seeding ${SEED_NAME} error. Error on parsing JSON ${data}`);
  }
};

exports.seed = () => {
  seedData(`${SEED_NAME}_${env}`);
};
