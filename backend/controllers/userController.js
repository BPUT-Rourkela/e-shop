const User = require('../models/User');

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('wishlist');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update User Profile (Personal Info)
exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, dob, gender, profilePicture } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.dob = dob !== undefined ? dob : user.dob;
    user.gender = gender !== undefined ? gender : user.gender;
    user.profilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;

    const updatedUser = await user.save();
    res.json({ message: 'Profile updated', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Address
exports.addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push(req.body);
    await user.save();
    res.json({ message: 'Address added', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await user.save();
    res.json({ message: 'Address updated', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull({ _id: req.params.id });
    await user.save();
    res.json({ message: 'Address deleted', addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Wishlist Item
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);
    
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
    } else {
      user.wishlist.splice(index, 1);
    }
    await user.save();
    res.json({ message: 'Wishlist updated', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add Payment Method
exports.addPaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.isDefault) {
      user.paymentMethods.forEach(pm => pm.isDefault = false);
    }
    user.paymentMethods.push(req.body);
    await user.save();
    res.json({ message: 'Payment method added', paymentMethods: user.paymentMethods });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Payment Method
exports.deletePaymentMethod = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      user.paymentMethods.pull({ _id: req.params.id });
      await user.save();
      res.json({ message: 'Payment method deleted', paymentMethods: user.paymentMethods });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};
