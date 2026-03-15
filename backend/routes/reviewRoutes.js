const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken } = require('../middleware/auth');

// POST: Submit a review (Customer)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const newReview = new Review({
      product: productId,
      user: req.user.id,
      userName: req.user.name, // Ensure your auth middleware passes the name
      rating,
      comment
    });
    await newReview.save();
    res.status(201).json({ message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch reviews for a specific product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
