// routes/analytics.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { exportOrdersPdf } = require('../controllers/adminController');
const { protect,requireAdmin } = require('../middleware/auth');

router.get('/dashboard', protect, analyticsController.getDashboardStats);
router.get('/export/orders/pdf', protect, requireAdmin, exportOrdersPdf);
module.exports = router; 