const { workerData, parentPort } = require('worker_threads');
const moment = require('moment');
const puppeteer = require('puppeteer');

const logger = require('../../config/logger');
const { messageTypes } = require('../../config/worker');
const { waitFor } = require('../../utils/helpers');
const { newMessage } = require('../../utils/workersMessage');
const { aliveTime } = require('../../config/worker');
const {
  runPeriod,
  parsePeriod,
  timesToParse,
  pageUrl,
} = require('./worker.config');

const db = require('../../models');
const APIError = require('../../utils/APIError');
const { UserProduct, Product, SearchResult, SearchString } = db;
const { Op } = UserProduct.sequelize.Sequelize;

const THIS_THREAD_ID = workerData.workerId;
const PARSE_INTERVAL = +(86400000 / timesToParse).toFixed(0);
const rootWorkerId = workerData.owner;

let browser = null;
let page = null;
let triesCounter = 0;

const productsToParse = [];

const intervals = [];

const clearIntervals = () => {
  intervals.forEach((interval) => {
    clearInterval(interval);
  });
  intervals.splice(0, intervals.length);
};

const closeBrowser = async () => {
  await browser.close();
  page = null;
};

const processExit = async () => {
  await closeBrowser();
  clearIntervals();
  process.exit(0);
};

const passCaptcha = async () => {
  if (!page) {
    return;
  }
  console.log('wait for capcha');
  try {
    await page.waitForSelector('#recaptcha-anchor');
  } catch (error) {
    return;
  }
  try {
    await page.click('#recaptcha-anchor > div.recaptcha-checkbox-border');
  } catch (error) {
    closeBrowser();
  }
};

const searchAndParse = async (searchString) => {
  if (!page) {
    logger.error('No page');
    return;
  }
  if (triesCounter > 5) {
    await closeBrowser();
    return;
  }
  ++triesCounter;
  console.log(`start parsing ${searchString}...`);
  await page.goto(
    `${pageUrl}search/?from_global=true&text=${searchString.replace(
      /  +/g,
      '+'
    )}`
  );
  console.log(`wait for search results...`);
  await waitFor(1000);
  try {
    await page.waitForSelector('div.widget-search-result-container');
  } catch (error) {
    logger.error(`Error on waiting for div.widget-search-result-container`);
    passCaptcha();
  }
  await waitFor(500);
  const searchResults = await page.evaluate(() => {
    const list = [];
    try {
      const fullTextResult = document.querySelector(
        'div[data-widget="fulltextResultsHeader"]'
      );
      if (fullTextResult.innerText.search(/товаров сейчас нет/g) !== -1) {
        list.push({
          message: 'No products',
          error: '',
          hasError: true,
        });
        return list;
      }
    } catch (error) {}
    let items = [];
    try {
      listContainer = document.querySelector(
        'div.widget-search-result-container'
      );
    } catch (error) {
      logger.error(error);
      return list;
    }
    try {
      items = listContainer.querySelectorAll('a.tile-hover-target');
    } catch (error) {
      logger.error(error);
      return list;
    }
    for (const item of items) {
      let link, price, title, seller, container;
      let hasError = false;
      try {
        container = item.parentNode;
      } catch (error) {
        hasError = true;
        list.push({
          message: 'Error on obtaining container',
          error,
          hasError,
        });
        continue;
      }
      try {
        seller = container
          .querySelectorAll('div')[1]
          .querySelector('div > span > span').innerHTML;
        seller = seller.substr(seller.indexOf(', продавец ') + 11);
      } catch (error) {
        continue;
      }
      try {
        link = item.href;
        link = link.substr(0, link.indexOf('?asb=') - 1);
      } catch (error) {
        hasError = true;
        link = 'Error on obtaining linkItem';
      }
      try {
        price = parseFloat(
          container
            .querySelector('div:nth-child(1) > span:nth-child(1)')
            .innerHTML.replace(/[^0-9.]/g, '')
        );
      } catch (error) {
        price = 'Error on obtaining priceItem';
        hasError = true;
      }
      try {
        title = container.querySelector('a > span > span').innerText;
      } catch (error) {
        title = 'Error on obtaining titleItem';
        hasError = true;
      }
      list.push({
        link,
        price,
        title,
        seller,
        hasError,
      });
    }
    return list;
  });
  console.log(searchResults);
  triesCounter = 0;
  return searchResults;
};

const parseNextProduct = async () => {
  if (!page) return;
  if (productsToParse.length === 0) return;
  const productToParse = productsToParse[0];
  logger.info('Parse product');
  const searchStrings = await SearchString.findAll({
    where: {
      ProductId: productToParse.id,
    },
  });
  let parseResults = [];
  for (ind in searchStrings) {
    try {
      parseResults = parseResults.concat(
        await searchAndParse(searchStrings[ind].searchString)
      );
      if (searchStrings.length > 1) await waitFor(1500);
    } catch (error) {
      await closeBrowser();
    }
  }
  if (parseResults.length === 0) return;
  productsToParse.splice(0, 1);
  if (parseResults.length === 1 && parseResults.find((res) => res.hasError && res.message === 'No products')) {
    productToParse.removeParseResults();
    return;
  }
  productToParse.saveParseResults(parseResults);
};

const populateProductsToParse = async () => {
  const lastProductPopulationTime = moment().utc().add(-PARSE_INTERVAL, 'ms');
  const products = await UserProduct.findAll({
    order: [['Product', 'lastTimeParsed', 'ASC']],
    limit: 50,
    include: [
      {
        model: Product,
        required: true,
        where: {
          isActive: true,
          lastTimeParsed: {
            [Op.or]: [
              {
                [Op.lt]: lastProductPopulationTime.format(
                  'YYYY-MM-DDTHH:mm:ssZ'
                ),
              },
              {
                [Op.eq]: null,
              },
            ],
          },
        },
      },
    ],
  });
  products.forEach((product) => {
    if (
      !productsToParse.some(
        (productToParse) => productToParse.id === product.Product.id
      )
    )
      productsToParse.push(product.Product);
  });
  return [];
};

/**
 * Worker entry point
 */
const run = async () => {
  if (!page) {
    try {
      browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
      });
      logger.info('puppeteer.launch');
      logger.info('browser.newPage');
      page = await browser.newPage();
      console.log(await page.browser().version());
      logger.info('setUserAgent');
      await page.setUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36'
      );
      logger.info('setViewport');
      await page.setViewport({ width: 1920, height: 1080 });
      logger.info('goto');
      await page.goto(pageUrl);
    } catch (error) {
      logger.error(error.message);
      return;
    }
    console.log('browser started');
    intervals.push(
      setInterval(() => {
        try {
          parseNextProduct();
        } catch (error) {
          logger.error('parseNextProduct thrown error');
        }
      }, parsePeriod)
    );
  }
  populateProductsToParse();
};

/**
 * Worker entry point
 */
const logMessage = (msg) => {
  logger.info(msg.data);
};

/**
 * List of available message processors
 */
const messageProcessors = {
  [messageTypes.info]: logMessage,
  [messageTypes.run]: run,
  [messageTypes.exit]: processExit,
};

/**
 * Handles incoming message
 * Call appropriate message processor in accordance to incoming message type
 *
 * @param   {Object}        msg           Incoming message
 */
const handleMessage = (msg) => {
  if (messageProcessors[msg.type]) {
    messageProcessors[msg.type](msg.data);
    return;
  }
  logger.error(
    `${THIS_THREAD_ID}: unhandled message from worker ${workerId}: ${msg}`
  );
};

/**
 * Post message to root process
 *
 * @param   {Any}        data           An object with supported data types (https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
 * @param   {String}     type           eventTypes enum item
 * @param   {Object}     recepient      Recipient worker id (root process as default)
 */
const sendMessage = async (
  data,
  type = messageTypes.info,
  recepient = rootWorkerId
) => {
  parentPort.postMessage(newMessage(THIS_THREAD_ID, recepient, type, data));
};

/**
 * System handlers
 * @private
 */
process.on('disconnect', () => {
  logger.error(
    `Thread ${THIS_THREAD_ID} is disconnected from parent process. Exitting...`
  );
  process.exit();
});

parentPort.on('message', (msg) => {
  if (typeof msg === 'object') {
    handleMessage(msg);
  } else {
    logger.error(`${THIS_THREAD_ID} unhandled message: ${msg}`);
  }
});

sendMessage(`Worker ${THIS_THREAD_ID} started`);

run();

intervals.push(
  setInterval(() => {
    sendMessage(`Worker ${THIS_THREAD_ID} is running`, messageTypes.keepAlive);
  }, aliveTime / 2)
);

intervals.push(
  setInterval(() => {
    run();
  }, runPeriod)
);
