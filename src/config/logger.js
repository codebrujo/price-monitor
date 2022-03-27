const winston = require('winston');
const { consoleFormat } = require('winston-console-format');
const { combine, timestamp, prettyPrint, colorize, padLevels, label } =
  winston.format;

const moment = require('moment');
const util = require('util');

const constants = require('./constants');

const tsFormat = winston.format(function (info, opts) {
  info.message = util.format(
    moment().utc().format('YYYY-MM-DD HH:mm:ss').trim(),
    info.message
  );
  return info;
});

let formatter;
if (constants.appProcessId) {
  formatter = combine(
    label({ label: constants.appProcessId }),
    tsFormat(),
    prettyPrint()
  );
} else {
  formatter = combine(tsFormat(), winston.format.ms(), prettyPrint());
}

const transports = [];
let level = process.env.NODE_ENV == 'production' ? 'error' : 'info';

if (!constants.isContainerized()) {
  transports.push(
    new winston.transports.File({ filename: './logs/combined.log' })
  );
  transports.push(
    new winston.transports.File({
      filename: './logs/error.log',
      level,
    })
  );
}

transports.push(
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      padLevels(),
      consoleFormat({
        showMeta: true,
        metaStrip: ['timestamp', 'service'],
        inspectOptions: {
          depth: Infinity,
          colors: true,
          maxArrayLength: Infinity,
          breakLength: 120,
          compact: Infinity,
        },
      })
    ),
    timestamp: true,
    level,
  })
);

const logger = winston.createLogger({
  level: 'info',
  format: formatter,
  transports,
});

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

/*global module*/
/*eslint no-undef: ["error", { "typeof": true }] */
module.exports = logger;
