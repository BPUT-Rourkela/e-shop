const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: String }, // Support ML ASINs or standard ObjectIds
      quantity: { type: Number, default: 1 },
      // Denormalized snapshot stored at order time — ensures ML recommendations
      // work even if the product is later deleted or re-imported with a new _id
      name:        { type: String, default: '' },
      category:    { type: String, default: '' },
      description: { type: String, default: '' },
      price:       { type: Number, default: 0 },
      image:       { type: String, default: '' }
    }
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] },
  paymentMethod: { type: String, default: 'COD' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);
