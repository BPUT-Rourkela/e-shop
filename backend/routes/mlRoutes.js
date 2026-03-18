const express = require('express');
const router = express.Router();
const mlController = require('../controllers/mlController');

router.post('/recommend', mlController.getRecommendations);
router.post('/analyze-sentiment', mlController.analyzeSentiment);

module.exports = router;
