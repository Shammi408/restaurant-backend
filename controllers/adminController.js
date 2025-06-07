// adminController.js
const Restaurant = require('../models/restaurant');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const PDFDocument = require('pdfkit');
const Order = require('../models/order');

exports.createRestaurant = async (req, res) => {
  try {
    const { name, location, cuisineTypes } = req.body;

    if (!name || !location) {
      return res.status(400).json({ success: false, message: 'Name and location are required' });
    }

    const restaurant = new Restaurant({
      name,
      location,
      cuisineTypes: Array.isArray(cuisineTypes) ? cuisineTypes : []
    });

    await restaurant.save();

    res.status(201).json({ 
      success: true, 
      restaurantId: restaurant._id 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create restaurant', 
      error: err.message 
    });
  }
};

exports.getAllRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find().sort('name');
  res.json({ success: true, data: restaurants });
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, restaurantId } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, restaurant: restaurantId });
    await user.save();
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  const users = await User.find().populate('restaurant', 'name');
  res.json({ success: true, data: users });
};

exports.exportOrdersPdf = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { role, restaurant } = req.user;
    // console.log('Received dates:', startDate, endDate);
    const filter = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Include entire day
        filter.createdAt.$lte = end;
      }
    }
    // Only apply restaurant filter for non-superadmin users
    if (role !== 'superadmin') {
      filter.restaurant = restaurant?._id;
    }


    const orders = await Order.find( filter ) // scoped to current admin
      .populate('items.itemId'); // adjust based on your actual schema

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders to export' });
    }

    const doc = new PDFDocument();
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res
        .writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="orders-report.pdf"',
          'Content-Length': pdfData.length
        })
        .end(pdfData);
    });
    // Title
    doc.fontSize(20).text('Orders Report', { align: 'center' }).moveDown();
    // Date range
    if (startDate || endDate) {
      const rangeText = `From: ${startDate || '...'}  To: ${endDate || '...'}`;
      doc.moveDown().fontSize(12).text(rangeText, { align: 'center' });
    }

    doc.moveDown();

    orders.forEach(order => {
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Customer: ${order.customerName || 'N/A'}`);
      doc.text(`Status: ${order.status}`);
      doc.text(`Total: ₹${order.totalAmount || order.total || 0}`);
      doc.text('Items:');
      order.items.forEach(item => {
        const name = item.itemId?.name || 'Deleted Item';
        doc.text(`  - ${name} x${item.quantity}`);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('PDF Export Error:', err); // Log the actual error
    res.status(500).json({ success: false, message: 'Failed to export PDF', error: err.message });
  }
};