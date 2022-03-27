const express = require('express');
const controller = require('../../controllers/v1/admin.controller');
const { authorize, ADMIN, checkRole } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load requestUser when API with userId route parameter is hit
 */
router.param('userId', controller.loadRequestUser);

router
  .route('/')
  /**
   * @api {get} v1/admin                                  Get application settings
   * @apiDescription Get application settings
   * @apiVersion 1.0.0
   * @apiName AppSettings
   * @apiGroup Admin
   * @apiPermission admin
   *
   * @apiSuccess {Object}
   *
   * @apiError (Unauthorized 401)  Unauthorized           Only authenticated users can access the data
   * @apiError (Unauthorized 403)  Forbidden              Only admins can access the data
   */
  .get(authorize, checkRole(ADMIN), controller.get);

router
  .route('/me')
  /**
   * @api {get} v1/admin/me                               Get current user
   * @apiDescription Get current user
   * @apiVersion 1.0.0
   * @apiName Me
   * @apiGroup Admin
   * @apiPermission user
   *
   * @apiSuccess {User}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the data
   */
  .get(authorize, controller.me);


router
  .route('/users')
  /**
   * @api {get} v1/admin/users                            List users
   * @apiDescription List existing users
   * @apiVersion 1.0.0
   * @apiName ListUsers
   * @apiGroup Admin
   * @apiPermission admin
   *
   * @apiSuccess {User[]}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the data
   * @apiError (Unauthorized 403) Forbidden               Only admins can access the data
   */
  .get(authorize, checkRole(ADMIN), controller.getUsers);

router
  .route('/users/:userId')
  /**
   * @api {get} v1/admin/users/:userId                    Detailed user info
   * @apiDescription Detailed information about user settings
   * @apiVersion 1.0.0
   * @apiName GetUser
   * @apiGroup Admin
   * @apiPermission admin
   *
   * @apiSuccess {User}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the data
   * @apiError (Unauthorized 403) Forbidden               Only admins can access the data
   * @apiError (Not Found 404)    NotFound                User does not exist
   */
  .get(authorize, checkRole(ADMIN), controller.getUserDetails)
  /**
   * @api {patch} v1/admin/users/:userId                  Change user data
   * @apiDescription Change given user data
   * @apiVersion 1.0.0
   * @apiName PatchUser
   * @apiGroup Admin
   * @apiPermission admin
   *
   * @apiParam   {Boolean}        isActive                Sets a new value of isActive flag
   * @apiParam   {String}         name                    Sets a new user name
   * @apiParam   {String}         role                    Sets a new user role
   * @apiParam   {String}         authToken               Sets a new User token
   * @apiParam   {Object}         properties              Update user properties
   *
   * @apiSuccess {User}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the endpoint
   * @apiError (Unauthorized 403) Forbidden               Only admins can access the endpoint
   * @apiError (Not Found 404)    NotFound                User does not exist
   */
  .patch(authorize, checkRole(ADMIN), controller.patchUser);

module.exports = router;
