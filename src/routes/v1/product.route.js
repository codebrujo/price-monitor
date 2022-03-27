const express = require('express');
const controller = require('../../controllers/v1/product.controller');
const { authorize } = require('../../middlewares/auth');

const router = express.Router();

/**
 * Load productId when API with userId route parameter is hit
 */
router.param('productId', controller.loadProduct);

router
  .route('/')
  /**
   * @api {get} v1/products                               Get products
   * @apiDescription Get all user products
   * @apiVersion 1.0.0
   * @apiName GetProducts
   * @apiGroup Products
   * @apiPermission user
   *
   * @apiSuccess {UserProduct[]}
   *
   * @apiError (Unauthorized 401)  Unauthorized           Only authenticated users can access the data
   */
  .get(authorize, controller.getProducts)
  /**
   * @api {post} v1/products                              Create product
   * @apiDescription Create a new product
   * @apiVersion 1.0.0
   * @apiName CreateProduct
   * @apiGroup Products
   * @apiPermission user
   * @apiParam   {String}         externalId              Product external Id
   * @apiParam   {Object}         properties              Set product properties
   * @apiParam   {String[]}       searchStrings           Array of search strings
   *
   * @apiSuccess {UserProduct}
   *
   * @apiError (Unauthorized 401)  Unauthorized           Only authenticated users can access the data
   */
  .post(authorize, controller.createProduct);

router
  .route('/:productId')
  /**
   * @api {get} v1/products/:productId                    Get product
   * @apiDescription Get user product by id
   * @apiVersion 1.0.0
   * @apiName GetProduct
   * @apiGroup Products
   * @apiPermission user
   *
   * @apiSuccess {UserProduct}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the data
   */
  .get(authorize, controller.get)
  /**
   * @api {patch} v1/products/:productId                  Update product
   * @apiDescription Update given product data
   * @apiVersion 1.0.0
   * @apiName PatchProduct
   * @apiGroup Products
   * @apiPermission user
   *
   * @apiParam   {String}         name                    Set product name
   * @apiParam   {Boolean}        isActive                Set activity indicator
   * @apiParam   {String}         externalId              Replace external Id
   * @apiParam   {Object}         properties              Set product properties
   * @apiParam   {String[]}       searchStrings           Array of search strings
   *
   * @apiSuccess {UserProduct}
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the endpoint
   * @apiError (Not Found 404)    NotFound                Product does not exist
   */
  .patch(authorize, controller.patchProduct)
  /**
   * @api {delete} v1/products/:productId                 Delete product
   * @apiDescription Delete product by productId
   * @apiVersion 1.0.0
   * @apiName DeleteProduct
   * @apiGroup Products
   * @apiPermission user
   *
   * @apiError (Unauthorized 401) Unauthorized            Only authenticated users can access the endpoint
   * @apiError (Not Found 404)    NotFound                Product does not exist
   */
  .delete(authorize, controller.deleteProduct);

module.exports = router;
