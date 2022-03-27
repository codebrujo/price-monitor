const path = require('path');

let isContainerized = true;

// import .env variables if the app is running in local env without docker
if (!process.env.JWT_SECRET) {
  isContainerized = false;
  require('dotenv-safe').config({
    path: path.join(__dirname, '../../.env'),
    sample: path.join(__dirname, '../../.env.example'),
    allowEmptyValues: true,
  });
}

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT || process.env.DEFAULT_PORT,
  protocol: process.env.EXPOSED_PROTOCOL,
  jwtSecret: process.env.JWT_SECRET,
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'common',
  isContainerized: () => isContainerized,
  serverUrl: '',
  setServerUrl: function (url) {
    this.serverUrl = process.env.APP_HOST;
    if (!this.serverUrl) {
      this.serverUrl = url;
    }
  },
  getServerUrl: function () {
    return this.serverUrl ? this.serverUrl : process.env.APP_HOST;
  },
  getServerDomainUrl: function () {
    let url = this.serverUrl ? this.serverUrl : process.env.APP_HOST;
    if (url) {
      const urlArray = url.split('.');
      if (urlArray.length > 2) {
        urlArray.shift();
      }
      url = urlArray.join('.');
    }
    return url;
  },
  getApiUrl: function () {
    if (process.env.API_HOST) {
      return process.env.API_HOST;
    } else {
      return this.serverUrl;
    }
  },
  certificateConfig: {
    pemPath: process.env.CERT_PEM_PATH,
    keyPath: process.env.CERT_KEY_PATH,
  },
  pgConfig: {
    db: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    passwd: process.env.POSTGRES_PASSWORD,
  },
  _appEntryPoint: null,
  set appEntryPoint(value) {
    this._appEntryPoint = value;
  },
  get appEntryPoint() {
    return this._appEntryPoint;
  },
  _appProcessId: null,
  set appProcessId(value) {
    this._appProcessId = value;
  },
  get appProcessId() {
    return this._appProcessId;
  },
};
