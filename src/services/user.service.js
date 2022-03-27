const { homeConnectConfig } = require('../config/constants');
const axios = require('axios');
const url = require('url');
const logger = require('../config/logger');
const db = require('../models');

const { User } = db;

const calculateUserFlowId = (userId = 0) => {
  if (!userId % 2) {
    return 1;
  } else if (!userId % 3) {
    return 2;
  }
  return 0;
};

const getUserFlowId = (user) => {
  if (!user.id % 2) {
    return 1;
  } else if (!user.id % 3) {
    return 2;
  }
  return 0;
};

exports.calculateUserFlowId = calculateUserFlowId;

const getUserDetails = (user) => {
  return {
    userId: user.id,
    userFlowId: getUserFlowId(user),
  };
};

exports.getUserAuthStatus = (user, withDetails = false) => {
  const response = {
    authStatus: null,
    details: null,
  };
  if (user && user.oauthToken) {
    response.authStatus = {
      homeconnect: true,
      shopify: false,
    };
    if (user.subscriptionDetails && user.subscriptionDetails.authorized) {
      response.authStatus.shopify = true;
    }
    if (withDetails) {
      response.details = getUserDetails(user);
    }
  }
  return response;
};

exports.refreshToken = async (user) => {
  const data = new url.URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: user.oauthRefreshToken,
    client_secret: homeConnectConfig.clientSecret,
    scope: homeConnectConfig.scope.reduce((init, item) => {
      return init ? init + ' ' + item : item;
    }, ''),
  });
  const res = await axios({
    method: 'post',
    url: `${homeConnectConfig.apiUrl}${homeConnectConfig.tokenURL}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  });
  return res;
};
