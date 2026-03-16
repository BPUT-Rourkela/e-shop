const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { verifyToken, isAdmin } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(verifyToken, isAdmin);

// --- OVERVIEW STATS ---
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();
    const revenueData = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Orders per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const salesByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({ totalOrders, totalUsers, totalProducts, totalRevenue, salesByDay });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ORDERS MANAGEMENT ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'name email').populate('products.product', 'name price');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CUSTOMER MANAGEMENT ---
router.get('/customers', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }).select('-password');
    // Attach order count and total spend per customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        return {
          ...customer.toObject(),
          orderCount: orders.length,
          totalSpend
        };
      })
    );
    res.json(customersWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get full order history for a specific customer
router.get('/customers/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- TRANSACTIONS ---
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Order.find()
      .populate('user', 'name email')
      .select('totalAmount paymentMethod status createdAt user')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ANALYTICS ---
router.get('/analytics', async (req, res) => {
  try {
    // Top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.product', totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', totalSold: 1, price: '$product.price', image: '$product.image' } }
    ]);

    // Revenue by month
    const revenueByMonth = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      { $limit: 12 }
    ]);

    // Category distribution
    const categoryStats = await Order.aggregate([
      { $unwind: '$products' },
      { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $group: { _id: '$productInfo.category', count: { $sum: '$products.quantity' }, revenue: { $sum: '$productInfo.price' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ topProducts, revenueByMonth, categoryStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- REVIEWS / SENTIMENT ---
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name image')
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales stats for old chart compatibility
router.get('/sales-stats', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
