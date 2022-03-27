const express = require('express');
const adminRoutes = require('./admin.route');
const productRoutes = require('./product.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.use('/admin', adminRoutes);

router.use('/products', productRoutes);

module.exports = router;