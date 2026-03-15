const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, isAdmin } = require('../middleware/auth');

// PUBLIC: Browse products (Customer)
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// PRIVATE: Add product (Admin only)
router.post('/add', verifyToken, isAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    // Fixed typo: was newUser.save(), changed to newProduct.save()
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PRIVATE: Delete product (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
