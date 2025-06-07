const Order = require('../models/order');
const MenuItem = require('../models/menuItem');
const Restaurant = require('../models/restaurant');
// creating an order with auto-calculated totalAmount
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerContact, items, notes } = req.body;

    // Basic validation
    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and items are required, and items cannot be empty.'
      });
    }

    // Extract all menu item IDs from order items
    const itemIds = items.map(item => item.itemId);

    // Fetch the menu items from DB that are active
    const menuItems = await MenuItem.find({ _id: { $in: itemIds }, isActive: true });

    // Validate that all requested items exist and are active
    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more menu items are invalid or inactive.'
      });
    }

    // Ensure all menu items belong to the same restaurant
    const restaurantIdsSet = new Set(menuItems.map(item => item.restaurant.toString()));
    if (restaurantIdsSet.size !== 1) {
      return res.status(400).json({
        success: false,
        message: 'All items must be from the same restaurant.'
      });
    }

    // Get the single restaurant ID from menu items
    const restaurantId = menuItems[0].restaurant;

    // Verify that restaurant exists (optional if you trust data integrity)
    const restaurantExists = await Restaurant.findById(restaurantId);
    if (!restaurantExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID associated with the menu items.'
      });
    }

    // Calculate total price and prepare order items with quantities & customizations
    let totalPrice = 0;
    const populatedItems = items.map(orderItem => {
      const matchedMenuItem = menuItems.find(menu => menu._id.toString() === orderItem.itemId);
      const quantity = orderItem.quantity && orderItem.quantity > 0 ? orderItem.quantity : 1;
      totalPrice += matchedMenuItem.price * quantity;

      return {
        itemId: matchedMenuItem._id,
        quantity,
        customizations: orderItem.customizations || ''
      };
    });

    // Create order with all validated data
    const order = new Order({
      customerName,
      customerContact,
      items: populatedItems,
      notes,
      totalAmount: totalPrice,
      restaurant: restaurantId,
      user: req.user._id 
    });

    console.log('Creating order with:', order);

    // Save order to DB
    const savedOrder = await order.save();

    // Respond with success and saved order data
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: savedOrder
    });

  } catch (err) {
    console.error('Order creation error:', err);

    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: err.message
    });
  }
};


//view all orders with filters
exports.getAllOrders = async (req, res) => {
  try {
    const { status, isActive } = req.query;

    // Build filter object dynamically
    let filter = {};
    if (req.user.role === 'admin') {
      // Admin: Filter by their restaurant
      filter.restaurant = req.user.restaurant?._id;
    } else if (req.user.role === 'customer') {
      // Regular user: See only their own orders
      filter.user = req.user._id;
    }
    if (status) {
      filter.status = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true'; // convert string to boolean
    }

    const orders = await Order.find(filter)
    .populate('items.itemId')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: err.message
    });
  }
};

//updating orders
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const validStatuses = ["Placed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed statuses: ${validStatuses.join(', ')}`
      });
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Prevent status updates if already Delivered or Cancelled
    if (["Delivered", "Cancelled"].includes(existingOrder.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update status. Order is already ${existingOrder.status}.`
      });
    }

    // Optional: avoid redundant update
    if (existingOrder.status === status) {
      return res.status(200).json({
        success: true,
        message: 'Status is already up to date',
        data: existingOrder
      });
    }

    existingOrder.status = status;
    existingOrder.updatedAt = new Date(); // update timestamp
    const updatedOrder = await existingOrder.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status', error: error.message });
  }
};


//soft deleteing delivered or cancelled orders
// Soft delete (cancel) an order
exports.softDeleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order || !order.isActive) {
      return res.status(404).json({ success: false, message: 'Order not found or already deleted' });
    }

    if (['Delivered', 'Cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}` });
    }

    order.isActive = false;
    order.status = 'Cancelled'; // Optional: Mark it as cancelled
    await order.save();

    res.status(200).json({ success: true, message: 'Order soft deleted successfully', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error soft deleting order', error: err.message });
  }
};


