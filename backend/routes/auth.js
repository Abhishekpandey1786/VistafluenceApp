const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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

// --- Step 1: request an OTP to be emailed for password reset ---
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // Respond the same way whether or not the user exists, so attackers
    // can't use this endpoint to find out which emails are registered.
    if (!user) {
      return res.json({ success: true, message: 'If that email is registered, an OTP has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordOTP = hashedOtp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // valid for 10 minutes
    await user.save({ validateBeforeSave: false });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Vistafluence" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your password reset code',
      html: `
        <div style="font-family: sans-serif;">
          <h2>Password Reset</h2>
          <p>Use the code below to reset your Vistafluence password. It expires in 10 minutes.</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'If that email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ success: false, message: 'Could not send OTP. Please try again.' });
  }
});

// --- Step 2: verify OTP + set a new password ---
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      resetPasswordOTP: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword; // pre('save') hook in the model will hash this
    user.resetPasswordOTP = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password has been reset. Please log in.' });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ success: false, message: 'Could not reset password. Please try again.' });
  }
});

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  return obj;
}

module.exports = router;