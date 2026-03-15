const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Get Sales Data for Recharts [cite: 34, 65]
router.get('/sales-stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
