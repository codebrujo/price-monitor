const httpStatus = require('http-status');
const { updateModel } = require('../utils/helpers');

const db = require('../models');
const { User } = db;

const {
  env,
  getServerUrl,
  isContainerized,
  getServerDomainUrl,
  getApiUrl,
  isSessionDisabled,
} = require('../config/constants');

exports.getSettings = () => {
  return {
    general: {
      env,
      serverUrl: getServerUrl(),
      isContainerized: isContainerized(),
      serverDomainUrl: getServerDomainUrl(),
      apiUrl: getApiUrl(),
      isSessionDisabled,
    },
  };
};

exports.listUsers = async () => {
  return await User.findAll({
    attributes: [
      'id',
      'isActive',
      'oauthId',
      'role',
      'oauthTokenExp',
      'createdAt',
      'updatedAt',
    ],
  });
};

exports.getUser = async (user) => {
  return {
    ...user.dataValues,
    userDevices: await UserDevice.findAll({
      attributes: [
        'id',
        'isActive',
        'createdAt',
        'updatedAt',
      ],
      where: {
        UserId: user.id,
      },
      include: [
        {
          model: Device,
          required: true,
          attributes: ['id', 'haId', 'properties'],
        },
      ],
    }),
  };
};

exports.updateUser = async (user, body) => {
  return await updateModel(User, user, body, ['id', 'updatedAt', 'createdAt']);
};
