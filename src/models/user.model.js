const httpStatus = require('http-status');
const logger = require('../config/logger');
const APIError = require('../utils/APIError');

/**
 * User Roles
 */
const roles = ['user', 'admin'];

/**
 * User Schema
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    authToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });


  /**
   * Check if User is admin or not
   */
  User.prototype.isAdmin = function () {
    return this.role === roles[1];
  };

  User.getRoles = () => roles;

  User.getAvailableRoles = () => {
    return {
      USER: roles[0],
      ADMIN: roles[1],
    };
  };

  /**
   * Get user
   *
   * @param {ObjectId} id - The id of user.
   * @returns {<User, APIError>}
   */
  User.get = async (id) => {
    let user;
    user = await User.findByPk(id);
    if (user) {
      return user;
    }
    throw new APIError({
      message: 'User does not exist',
      status: httpStatus.NOT_FOUND,
      source: 'user.model',
    });
  };

  /**
   * Returns user's list
   *
   * @param   {options} options    filter options
   * @returns {[User]}
   */
  User.list = async (options) => {
    return User.findAll(options);
  };

  /**
   * Change isActive status of user by id
   *
   * @param   {Number}          id    User's id
   * @returns {User|APIError}
   */
  User.changeIsActive = async (id, value) => {
    const error = new APIError({
      message: `User with id ${id} does not exist`,
      source: 'user.model',
    });
    const user = await User.findOne({
      where: {
        id,
      },
    });
    if (!user) {
      throw error;
    }
    try {
      user.isActive = value;
      return await user.save();
    } catch (e) {
      error.message = e.message;
      logger.error(`user.model changeIsActive ${id}: ${e.message}`);
    }
    throw error;
  };

  // User.associate = (models) => {
  //   User.hasMany(models.UserDevice);
  //   User.hasMany(models.UserDeviceEvent);
  // };

  return User;
};
