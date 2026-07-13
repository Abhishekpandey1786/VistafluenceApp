const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const { protect: authMiddleware } = require('../middleware/auth');
const InfluencerProfile = require('../models/InfluencerProfile');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doc = await InfluencerProfile.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: {
          user:  userId,
          email: req.user.email,
          name:  req.user.name || req.user.username || 'New Creator',
          role:  (req.user.role === 'creator') ? 'creator' : 'influencer',
        }
      },
      { upsert: true, new: true }
    );

    if (doc.role !== 'influencer' && doc.role !== 'creator') {
      return res.status(403).json({ success: false, message: 'Access denied. Not an influencer account.' });
    }

    const profile = {
      id:                  doc._id,
      role:                doc.role,
      name:                doc.name                || '',
      username:            doc.username            || doc.name || '',
      handle:              doc.handle              || '',
      email:               doc.email               || '',
      avatar:              doc.avatar              || '',
      coverImage:          doc.coverImage          || '',
      bio:                 doc.bio                 || '',
      location:            doc.location            || '',
      categories:          doc.categories          || '',
      website:             doc.website             || '',
      phone:               doc.phone               || '',
      followers:           doc.followers           || '0',
      engagement:          doc.engagement          || '0%',
      perPost:             doc.perPost             || '₹0',
      instagramLink:       doc.instagramLink       || '',
      instagramFollowers:  doc.instagramFollowers  || '',
      youtubeLink:         doc.youtubeLink         || '',
      youtubeFollowers:    doc.youtubeFollowers    || '',
      tiktokLink:          doc.tiktokLink          || '',
      tiktokFollowers:     doc.tiktokFollowers     || '',
      twitterLink:         doc.twitterLink         || '',
      twitterFollowers:    doc.twitterFollowers    || '',
      linkedinLink:        doc.linkedinLink        || '',
      linkedinFollowers:   doc.linkedinFollowers   || '',
      facebookLink:        doc.facebookLink        || '',
      facebookFollowers:   doc.facebookFollowers   || '',
      verified:            doc.verified            || false,
      createdAt:           doc.createdAt,
      updatedAt:           doc.updatedAt,
    };

    return res.status(200).json({ success: true, profile });

  } catch (err) {
    console.error('[influencer/profile GET]', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const doc = await InfluencerProfile.findOne({ user: userId });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Influencer profile not found',
      });
    }

    if (doc.role !== 'influencer' && doc.role !== 'creator') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Not an influencer account.',
      });
    }

    const ALLOWED_FIELDS = [
      'username',
      'handle',
      'email',
      'bio',
      'location',
      'categories',
      'website',
      'phone',
      'avatar',
      'coverImage',
      'followers',
      'engagement',
      'perPost',
      'instagramLink',
      'instagramFollowers',
      'youtubeLink',
      'youtubeFollowers',
      'tiktokLink',
      'tiktokFollowers',
      'twitterLink',
      'twitterFollowers',
      'linkedinLink',
      'linkedinFollowers',
      'facebookLink',
      'facebookFollowers',
    ];

    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.handle && updates.handle.startsWith('@')) {
      updates.handle = updates.handle.slice(1);
    }

    // Avatar Upload To Cloudinary
    if (
      updates.avatar &&
      typeof updates.avatar === 'string' &&
      updates.avatar.startsWith('data:image')
    ) {
      const uploadRes = await cloudinary.uploader.upload(
        updates.avatar,
        {
          folder: 'vistafluence_profiles/avatars',
        }
      );

      updates.avatar = uploadRes.secure_url;
    }

    // Cover Image Upload To Cloudinary
    if (
      updates.coverImage &&
      typeof updates.coverImage === 'string' &&
      updates.coverImage.startsWith('data:image')
    ) {
      const uploadRes = await cloudinary.uploader.upload(
        updates.coverImage,
        {
          folder: 'vistafluence_profiles/covers',
        }
      );

      updates.coverImage = uploadRes.secure_url;
    }

    const updatedDoc = await InfluencerProfile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    const profile = {
      id: updatedDoc._id,
      role: updatedDoc.role,
      name: updatedDoc.name || '',
      username: updatedDoc.username || updatedDoc.name || '',
      handle: updatedDoc.handle || '',
      email: updatedDoc.email || '',
      avatar: updatedDoc.avatar || '',
      coverImage: updatedDoc.coverImage || '',
      bio: updatedDoc.bio || '',
      location: updatedDoc.location || '',
      categories: updatedDoc.categories || '',
      website: updatedDoc.website || '',
      phone: updatedDoc.phone || '',
      followers: updatedDoc.followers || '0',
      engagement: updatedDoc.engagement || '0%',
      perPost: updatedDoc.perPost || '₹0',

      instagramLink: updatedDoc.instagramLink || '',
      instagramFollowers: updatedDoc.instagramFollowers || '',

      youtubeLink: updatedDoc.youtubeLink || '',
      youtubeFollowers: updatedDoc.youtubeFollowers || '',

      tiktokLink: updatedDoc.tiktokLink || '',
      tiktokFollowers: updatedDoc.tiktokFollowers || '',

      twitterLink: updatedDoc.twitterLink || '',
      twitterFollowers: updatedDoc.twitterFollowers || '',

      linkedinLink: updatedDoc.linkedinLink || '',
      linkedinFollowers: updatedDoc.linkedinFollowers || '',

      facebookLink: updatedDoc.facebookLink || '',
      facebookFollowers: updatedDoc.facebookFollowers || '',

      verified: updatedDoc.verified || false,
      updatedAt: updatedDoc.updatedAt,
    };

    return res.status(200).json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    console.error('[influencer/profile PUT]', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
});
router.get('/public/:influencerId', async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ user: req.params.influencerId });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;