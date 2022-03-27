const path = require('path');
const https = require('https');
const fs = require('fs');
const constants = require('./config/constants');

constants.appEntryPoint = path.basename(__filename, '.js');

const {
  port,
  env,
  protocol,
  certificateConfig: { pemPath, keyPath },
} = constants;

const logger = require('./config/logger');
const app = require('./config/express');
const { seedAll } = require('./seeds');

// listen to requests
if (protocol === 'https') {
  const httpsOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(pemPath),
  };
  https.createServer(httpsOptions, app).listen(port, () => {
    const msg = `server started on port ${port} (https) (${env})`;
    logger.info(msg);
  });
} else {
  app.listen(port, () => {
    const msg = `server started on port ${port} (http) (${env})`;
    logger.info(msg);
  });
}

seedAll();

require('./workers');

/**
 * Exports express
 * @public
 */
module.exports = app;