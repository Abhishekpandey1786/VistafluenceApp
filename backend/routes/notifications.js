const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const list = await Notification.find({ recipientId: req.user._id })
    .sort({ createdAt: -1 }).limit(100);
  res.json(list);
});

router.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ recipientId: req.user._id, read: false }, { read: true });
  res.json({ ok: true });
});

router.patch('/:id/read', protect, async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, recipientId: req.user._id }, { read: true });
  res.json({ ok: true });
});

module.exports = router;
