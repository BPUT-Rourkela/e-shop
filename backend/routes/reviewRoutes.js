const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { verifyToken, isAdmin } = require('../middleware/auth');

// POST: Submit a review (Customer)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    let sentiment = 'Neutral'; // Default in case ML is completely down
    
    try {
      const axios = require('axios');
      const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';
      
      // Fetch the sentiment purely via the ML API
      const mlResponse = await axios.post(`${ML_API_URL}/analyze_sentiment`, { text: comment });
      
      if (mlResponse.data && mlResponse.data.sentiment) {
        // Use the exact category provided by the ML model ('Positive', 'Negative', or 'Neutral')
        let sentStr = mlResponse.data.sentiment;
        if (typeof sentStr === 'string' && sentStr.trim() !== '') {
           sentiment = sentStr;
        }
      }
    } catch (err) {
      console.error('Error fetching sentiment from ML API:', err.message);
    }

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
