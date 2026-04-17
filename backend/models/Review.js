const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: String, ref: 'Product', required: true }, // Suppports both MongoDB IDs (for population) and ML ASINs (as strings)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  sentiment: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
