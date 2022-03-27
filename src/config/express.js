const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const { v4: uuidv4 } = require('uuid');
const cookieParser = require('cookie-parser');
const nocache = require('nocache');
const routesV1 = require('../routes/v1');
const {
  logs,
  setServerUrl,
  serverUrl,
} = require('./constants');
const error = require('../middlewares/error');

/**
 * Express instance
 * @public
 */
const app = express();

// request logging. dev: console | production: file
app.use(morgan(logs));

// parse body params and attache them to req.body
app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
  extended: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));

// gzip compression
app.use(compress());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable specific cors session headers
app.use((req, res, next) => {
  res.append(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, authorization'
  );
  res.append(
    'Access-Control-Allow-Methods',
    'GET,POST,DELETE,PUT,PATCH,OPTIONS'
  );
  next();
});

// disable cache
app.use(nocache());

// enable proxy
app.set('trust proxy', 1);

//enable cookies
app.use(cookieParser());

// add trace id
const addTraceId = (req, res) => {
  let traceId = req.header('x-request-id');
  if (!traceId) {
    traceId = uuidv4();
  }
  res.header('x-request-id', traceId);
  res.locals.traceId = traceId;
}

const defineServerUrl = (req, res, next) => {
  if (!serverUrl) {
    setServerUrl(req.get('host'));
  }
  addTraceId(req, res);
  next();
}

app.post('*', defineServerUrl);
app.patch('*', defineServerUrl);
app.get('*', defineServerUrl);
app.put('*', defineServerUrl);
app.delete('*', defineServerUrl);

app.use(express.static('./public'));

// mount routes
app.use('/api/v1', routesV1);

// if error is not an instanceOf APIError, convert it.
app.use(error.converter);

// catch 404 and forward to error handler
app.use(error.notFound);

// error handler, send stacktrace only during development
app.use(error.handler);

/*global module*/
/*eslint no-undef: ["error", { "typeof": true }] */
module.exports = app;