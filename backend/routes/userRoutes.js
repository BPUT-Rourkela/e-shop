const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
  getUserProfile, 
  updateUserProfile, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  toggleWishlist,
  addPaymentMethod,
  deletePaymentMethod,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

router.post('/wishlist/toggle', toggleWishlist);

router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);

router.post('/cart', addToCart);
router.delete('/cart/:productId', removeFromCart);
router.delete('/cart', clearCart);

module.exports = router;
