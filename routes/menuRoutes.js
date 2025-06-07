const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect } = require('../middleware/auth');  // adjust path if needed


router.post('/menu', protect,menuController.createMenuItem);
router.get('/menu', menuController.getMenuItems);
router.patch('/menu/:id/availability', menuController.updateAvailability);
router.get('/menu/:id', menuController.getMenuItemById);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.softDeleteMenuItem);
router.patch('/menu/:id/soft-delete', menuController.softDeleteMenuItem);
// DELETE /api/menu/all — deletes ALL menu items
router.post('/deleteAll', menuController.deleteAllMenuItems);


module.exports = router;
