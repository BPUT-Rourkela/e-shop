const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  amazon_id: { type: String, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // Content-based filtering later [cite: 39]
  image: { type: String },
  isTrending: { type: Boolean, default: false },
  isRecommended: { type: Boolean, default: false },
  purchaseCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
