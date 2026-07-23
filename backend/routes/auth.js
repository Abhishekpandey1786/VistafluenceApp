const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const resend = new Resend(process.env.RESEND_API_KEY);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

function sanitize(user) {
  const obj = user.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
}

// ---------------- REGISTER ----------------
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

// ---------------- LOGIN ----------------
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

// ---------------- ME ----------------
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ---------------- FORGOT PASSWORD ----------------
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      // Security ke liye user na hone par bhi success bolo
      return res.json({ success: true, message: 'If that email exists, a reset code has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    try {
      const { data, error } = await resend.emails.send({
        from: 'VistaFluence <onboarding@resend.dev>',
        to: user.email,
        subject: 'Password Reset Code - VistaFluence',
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>Your reset code (valid for 15 minutes):</p>
            <p style="font-family: monospace; background:#eee; padding:10px; font-size:16px; word-break:break-all;">${resetToken}</p>
            <p>Agar tumne ye request nahi ki, is email ko ignore kar do.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Resend error full details:', JSON.stringify(error, null, 2));
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        return res.status(500).json({ success: false, message: 'Failed to send email, please try again' });
      }

      console.log('Email sent:', data);
    } catch (emailErr) {
      console.error('Email sending exception:', emailErr);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: 'Failed to send email, please try again' });
    }

    res.json({ success: true, message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong, try again' });
  }
});

// ---------------- RESET PASSWORD ----------------
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset code' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful, please login' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;