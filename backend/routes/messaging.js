const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');
const Profile = require('../models/profile');
const InfluencerProfile = require('../models/Influencerprofile');
const { emitToUser, isUserOnline } = require('../utils/Socket');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

const getConversationId = (id1, id2) => [id1, id2].sort().join('_');
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file received' });
    }

    const isDoc =
      req.file.mimetype === 'application/pdf' || req.file.mimetype.includes('word');

    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const cldStream = cloudinary.uploader.upload_stream(
          { folder: 'chat_attachments', resource_type: isDoc ? 'raw' : 'image' },
          (error, result) => (result ? resolve(result) : reject(error))
        );
        streamifier.createReadStream(req.file.buffer).pipe(cldStream);
      });

    const result = await uploadFromBuffer();

    res.json({
      success: true,
      url: result.secure_url,
      resourceType: isDoc ? 'document' : 'image',
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.log('UPLOAD ERROR:', err);
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

router.get('/:userId', protect, async (req, res) => {
  try {
    const convId = getConversationId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ conversation: convId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: convId, receiver: req.user._id, read: false },
      { read: true }
    );

    emitToUser(req.params.userId, 'messages_read', {
      by: req.user._id.toString(),
      conversation: convId,
    });

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:userId', protect, async (req, res) => {
  try {
    const { text, messageType, fileUrl } = req.body;

    if (!text && !fileUrl) {
      return res.status(400).json({ success: false, message: 'Message text or file required' });
    }

    const convId = getConversationId(req.user._id.toString(), req.params.userId);
    const message = await Message.create({
      conversation: convId,
      sender: req.user._id,
      receiver: req.params.userId,
      text: text || '',
      messageType: messageType || 'text',
      fileUrl: fileUrl || '',
    });
    const populated = await message.populate('sender', 'name avatar');

    const delivered = emitToUser(req.params.userId, 'receive_message', populated);
    console.log(delivered ? '📨 Delivered live' : '📭 Receiver offline, saved to DB');

    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const currentUserRole = req.user.role;

    let acceptedApplications = [];
    let dynamicUsersMap = new Map();

    if (currentUserRole === 'brand') {
      acceptedApplications = await Application.find({
        brand: req.user._id,
        status: 'accepted',
      }).populate('influencer', 'name avatar role');

      acceptedApplications.forEach((app) => {
        if (app.influencer) {
          dynamicUsersMap.set(app.influencer._id.toString(), app.influencer);
        }
      });
    } else if (currentUserRole === 'influencer') {
      acceptedApplications = await Application.find({
        influencer: req.user._id,
        status: 'accepted',
      }).populate('brand', 'name avatar role');

      acceptedApplications.forEach((app) => {
        if (app.brand) {
          dynamicUsersMap.set(app.brand._id.toString(), app.brand);
        }
      });
    }

    const users = Array.from(dynamicUsersMap.values());

    const usersWithProfile = await Promise.all(
      users.map(async (user) => {
        let avatar = '';

        if (user.role === 'brand') {
          const profile = await Profile.findOne({ user: user._id });
          avatar = profile?.avatar || '';
        }

        if (user.role === 'influencer' || user.role === 'creator') {
          const profile = await InfluencerProfile.findOne({ user: user._id });
          avatar = profile?.avatar || '';
        }

        return {
          ...user.toObject(),
          avatar,
          online: isUserOnline(user._id.toString()),
        };
      })
    );

    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    }).sort({ createdAt: -1 });

    const convMap = {};
    for (const msg of messages) {
      const otherId =
        msg.sender.toString() === userId ? msg.receiver.toString() : msg.sender.toString();
      if (!convMap[otherId]) convMap[otherId] = msg;
    }

    const convList = await Promise.all(
      usersWithProfile.map(async (other) => {
        const otherId = other._id.toString();
        const lastMsg = convMap[otherId] || null;

        let unread = 0;
        if (lastMsg) {
          unread = await Message.countDocuments({
            conversation: lastMsg.conversation,
            receiver: req.user._id,
            read: false,
          });
        }

        return {
          user: other,
          lastMessage: lastMsg,
          unread,
        };
      })
    );

    convList.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage) return -1;
      if (b.lastMessage) return 1;
      return 0;
    });

    res.json({ success: true, conversations: convList });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;