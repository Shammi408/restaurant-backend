const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Protect all admin routes
router.use(authMiddleware.protect, authMiddleware.requireAdmin);

router.post('/restaurant', adminController.createRestaurant);
router.get('/restaurants', adminController.getAllRestaurants);

router.post('/user', adminController.createUser);
router.get('/users', adminController.getAllUsers);

module.exports = router;
