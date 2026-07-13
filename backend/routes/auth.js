const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
router.post('/register', async (req, res) => {
  try {
    const { role, email, password, name, niche, platforms, ratePerPromotion,
      companyName, industry, budget } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });

    const userData = { role, email, password, name };
    if (role === 'influencer') {
      Object.assign(userData, { niche, platforms, ratePerPromotion });
    } else if (role === 'brand') {
      Object.assign(userData, { companyName, industry, budget });
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: `Banned: ${user.banReason}` });
    }
    const token = generateToken(user._id);
    res.json({ success: true, token, user: sanitize(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

module.exports = router;