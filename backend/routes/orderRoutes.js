const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { verifyToken } = require('../middleware/auth');

// POST: Create a new order
router.post('/', verifyToken, async (req, res) => {
  try {
    // Fetch each product so we can snapshot its details into the order
    const mongoose = require('mongoose');
    const enrichedProducts = await Promise.all(
      req.body.products.map(async (item) => {
        let prod = null;
        if (mongoose.Types.ObjectId.isValid(item.product)) {
          prod = await Product.findById(item.product);
        }
        
        return {
          product:     item.product,
          quantity:    item.quantity || 1,
          // Denormalized snapshot: Use DB data if found, otherwise fallback to frontend supplied data
          name:        prod?.name        || item.name        || '',
          category:    prod?.category    || item.category    || '',
          description: prod?.description || item.description || '',
          price:       prod?.price       || item.price       || 0,
          image:       prod?.image       || item.image       || ''
        };
      })
    );

    const newOrder = new Order({
      user:          req.user.id,
      products:      enrichedProducts,
      totalAmount:   req.body.totalAmount,
      paymentMethod: req.body.paymentMethod || 'COD'
    });
    const savedOrder = await newOrder.save();

    // Increment purchaseCount for each product ordered (only valid objectids)
    await Promise.all(
      enrichedProducts.map(item => {
        if (mongoose.Types.ObjectId.isValid(item.product)) {
          return Product.findByIdAndUpdate(item.product, {
            $inc: { purchaseCount: item.quantity || 1 }
          });
        }
        return Promise.resolve();
      })
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
      .populate('products.product', 'name price image description category')
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
      .populate('products.product', 'name price image description category')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
