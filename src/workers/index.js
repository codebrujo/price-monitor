const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const constants = require('../config/constants');
constants.appEntryPoint = path.basename(__filename, '.js');
constants.appProcessId = uuidv4();
const WorkerThread = require('../utils/WorkerThread');
const logger = require('../config/logger');
const { messageTypes } = require('../config/worker');

const workers = [];

const notifyOnExit = (msg) => {
  logger.info(`Worker ${msg.sender} stopped with code ${msg.data}`);
}

const workersDir = path.normalize(`${__dirname}`);
fs.readdirSync(workersDir)
  .filter((file) => file.indexOf('.') === -1 && file !== 'index.js')
  // import model files and save model names
  .forEach((folder) => {
    const worker = new WorkerThread(
      path.normalize(`${__dirname}/${folder}/index.js`),
      folder,
      constants.appProcessId,
    );
    worker.subscribe(messageTypes.exit, notifyOnExit);
    worker.createWorker();
    workers.push(worker);
  });
