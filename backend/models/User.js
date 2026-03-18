const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin'], 
    default: 'customer' 
  },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  profilePicture: { type: String },
  addresses: [{
    name: String,
    phone: String,
    house: String,
    city: String,
    state: String,
    postalCode: String,
    type: { type: String, enum: ['Home', 'Office', 'Other'], default: 'Home' },
    isDefault: { type: Boolean, default: false }
  }],
  paymentMethods: [{
    type: { type: String, enum: ['Card', 'UPI', 'NetBanking', 'Wallet'] },
    details: String, // e.g., masked card num or UPI ID
    isDefault: { type: Boolean, default: false }
  }],
  wishlist: [{ type: String }], // Changed to String to support ML ASINs
  cart: [{
    product: String,
    name: String,
    price: Number,
    image: String,
    quantity: { type: Number, default: 1 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
