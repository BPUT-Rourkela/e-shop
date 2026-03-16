const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST: Submit a review (Customer)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    // Basic sentiment: positive if rating >= 4, negative if <= 2, neutral otherwise
    let sentiment = 'Neutral';
    if (rating >= 4) sentiment = 'Positive';
    else if (rating <= 2) sentiment = 'Negative';

    const newReview = new Review({
      product: productId,
      user: req.user.id,
      userName: req.user.name,
      rating,
      comment,
      sentiment
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

// ADMIN: Manually override a review's sentiment
router.patch('/:id/sentiment', verifyToken, isAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { sentiment: req.body.sentiment },
      { new: true }
    );
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
