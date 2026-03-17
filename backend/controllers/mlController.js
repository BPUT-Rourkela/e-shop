const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

exports.getRecommendations = async (req, res) => {
    try {
        const { product_texts, viewed_product_ids } = req.body;

        // Build the payload for the Python ML service
        // Primary: text-based (works with any MongoDB products)
        // Fallback: legacy Amazon product_id based
        const payload = {};

        if (product_texts && Array.isArray(product_texts) && product_texts.length > 0) {
            payload.product_texts = product_texts;
        } else if (viewed_product_ids && Array.isArray(viewed_product_ids) && viewed_product_ids.length > 0) {
            payload.viewed_product_ids = viewed_product_ids;
        } else {
            return res.status(400).json({ message: 'Provide product_texts or viewed_product_ids' });
        }

        const response = await axios.post(`${ML_API_URL}/recommend`, payload);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        res.status(500).json({ message: 'Error connecting to ML Service' });
    }
};

exports.analyzeSentiment = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'Text is required' });
        }

        const response = await axios.post(`${ML_API_URL}/analyze_sentiment`, { text });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error analyzing sentiment:', error.message);
        res.status(500).json({ message: 'Error connecting to ML Service' });
    }
};
