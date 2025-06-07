const Order = require('../models/order');
const MenuItem = require('../models/menuItem');

exports.getDashboardStats = async (req, res) => {
  try {
    const { role, restaurant } = req.user;
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const restaurantFilter = (role !== 'superadmin' && restaurant)
      ? { restaurant: restaurant._id }
      : {};

    const [totalOrders, totalRevenue, ordersPerDay, topItems, statusBreakdown] = await Promise.all([

      // Total Orders Count
      Order.countDocuments(restaurantFilter),

      // Total Revenue (excluding Cancelled)
      Order.aggregate([
        { $match: { ...restaurantFilter, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),

      // Orders per Day (last 30 days)
      Order.aggregate([
        {
          $match: {
            ...restaurantFilter,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Top 5 Ordered Items
      Order.aggregate([
        { $match: restaurantFilter },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.itemId',
            totalOrdered: { $sum: '$items.quantity' }
          }
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'menuitems',
            localField: '_id',
            foreignField: '_id',
            as: 'itemDetails'
          }
        },
        { $unwind: '$itemDetails' },
        {
          $project: {
            _id: 0,
            name: '$itemDetails.name',
            totalOrdered: 1
          }
        }
      ]),

      // Order Status Breakdown
      Order.aggregate([
        { $match: restaurantFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersPerDay,
        topItems,
        statusBreakdown
      }
    });

  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({
      success: false,
      message: 'Analytics fetch failed',
      error: err.message
    });
  }
};

