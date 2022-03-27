const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');


exports.seedAll = () => {
  const seedsDir = path.normalize(`${__dirname}`);
  fs.readdirSync(seedsDir)
    .filter((file) => (file.indexOf('.') !== 0) && (file.indexOf('.map') === -1) && (file !== 'index.js') && (file !== 'data'))
    // import seed files and run seed
    .forEach((file) => {
      logger.info(`Run seed module ${file}`);
      const seedModule = require(path.join(seedsDir, file));
      setTimeout(() => {
        seedModule.seed();
      }, seedModule.sequenceOrder);
    });
}