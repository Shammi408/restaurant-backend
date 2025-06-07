const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// console.log('orderController:', orderController);
router.post('/orders', protect, orderController.createOrder);
router.get('/orders', protect, orderController.getAllOrders);
// router.put('/orders/:id', orderController.updateOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);
router.delete('/orders/:id', orderController.softDeleteOrder);

module.exports = router;
