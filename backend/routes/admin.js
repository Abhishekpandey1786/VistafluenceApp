const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');
const adminOnly = [protect, authorize('admin')];
const { notify, notifyRole } = require('../utils/notify');


router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalInfluencers, totalBrands, totalCampaigns,
      activeCampaigns, totalApplications, bannedUsers] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ role: 'influencer' }),
      User.countDocuments({ role: 'brand' }),
      Campaign.countDocuments(),
      Campaign.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      User.countDocuments({ isBanned: true }),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const subscriptions = await User.aggregate([
      { $match: { role: 'influencer' } },
      { $group: { _id: '$subscription.plan', count: { $sum: 1 } } },
    ]);

    const monthly = await User.aggregate([
      {
        $match: {
          role: { $ne: 'admin' },
          createdAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalInfluencers, totalBrands, totalCampaigns,
        activeCampaigns, totalApplications, bannedUsers, newUsers,
      },
      subscriptions,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20, banned } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (banned !== undefined) filter.isBanned = banned === 'true';
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id/ban', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true, banReason: req.body.reason || 'Violated terms' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id/unban', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false, banReason: '' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/users/:id', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id/academy', ...adminOnly, async (req, res) => {
  try {
    const { access } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { academyAccess: access },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      user,
      message: access ? 'Academy access granted' : 'Academy access revoked',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put('/users/:id/subscription', ...adminOnly, async (req, res) => {
  try {
    const { plan } = req.body;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const academyAccess = ['Advance', 'Premium'].includes(plan);
 
    const user = await User.findByIdAndUpdate(req.params.id,
      {
        'subscription.plan': plan,
        'subscription.status': 'Active',
        'subscription.startDate': new Date(),
        'subscription.endDate': endDate,
        academyAccess,
      },
      { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/campaigns', ...adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const campaigns = await Campaign.find(filter)
      .populate('brand', 'name companyName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Campaign.countDocuments(filter);
    res.json({ success: true, campaigns, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/campaigns/:id/status', ...adminOnly, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/campaigns/:id', ...adminOnly, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/applications', ...adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const applications = await Application.find(filter)
      .populate('influencer', 'name email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/applications/:id', ...adminOnly, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/create-admin', ...adminOnly, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    const admin = await User.create({ role: 'admin', email, password, name });
    res.status(201).json({
      success: true,
      message: 'Admin created',
      admin: { id: admin._id, email: admin.email, name: admin.name },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/broadcast', ...adminOnly, async (req, res) => {
  const { title, body, target = 'all', urgent = true } = req.body;
  if (!title || !body) return res.status(400).json({ msg: 'title & body required' });

  const payload = { type: 'admin', title, body, urgent };

  if (target === 'all') {
    await notifyRole('influencer', payload);   // influencers
    await notifyRole('advertiser', payload);   // advertisers — notifyRole internally 'brand' se dhundega
  } else {
    await notifyRole(target, payload);         // 'influencer' ya 'advertiser' dono kaam karega
  }

  res.json({ ok: true });
});
module.exports = router;