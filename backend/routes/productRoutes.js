const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth');

// PUBLIC: Browse products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC: Get trending products
router.get('/trending', async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true }).sort({ purchaseCount: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUBLIC: Get recommended products
router.get('/recommended', async (req, res) => {
  try {
    const products = await Product.find({ isRecommended: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Add product
router.post('/add', verifyToken, isAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Update product details
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Toggle trending status
router.patch('/:id/trending', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isTrending = !product.isTrending;
    await product.save();
    res.json({ isTrending: product.isTrending, message: `Product ${product.isTrending ? 'marked as' : 'removed from'} trending` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Toggle recommended status
router.patch('/:id/recommended', verifyToken, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.isRecommended = !product.isRecommended;
    await product.save();
    res.json({ isRecommended: product.isRecommended, message: `Product ${product.isRecommended ? 'marked as' : 'removed from'} recommended` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Delete product
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
