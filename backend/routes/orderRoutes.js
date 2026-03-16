const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// POST: Create a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const newOrder = new Order({
      user: req.user.id,
      products: req.body.products,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod || 'COD'
    });
    const savedOrder = await newOrder.save();

    // Increment purchaseCount for each product ordered
    await Promise.all(
      req.body.products.map(item =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { purchaseCount: item.quantity || 1 }
        })
      )
    );

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: My orders (customer)
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alias for frontend compatibility
router.get('/myorders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
