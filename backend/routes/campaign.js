const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Profile = require('../models/profile');
const { notify, notifyRole } = require('../utils/notify');
const { getMaxApplications, syncSubscriptionState } = require('../utils/planLimits');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const filter = { status: 'active' };
    if (category) filter.category = category;
    const campaigns = await Campaign.find(filter)
      .populate('brand', 'name companyName avatar logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Campaign.countDocuments(filter);
    
    res.json({ 
      success: true, 
      campaigns, 
      total, 
      pages: Math.ceil(total / limit) 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/feed', protect, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 10;

    let campaigns = await Campaign.find({
      status: 'active'
    })
      .populate('brand', 'name companyName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    campaigns = await Promise.all(
      campaigns.map(async (campaign) => {

        const profile = await Profile.findOne({
          user: campaign.brand._id
        }).select('avatar coverImage brandName verified');

        return {
          ...campaign,

          brand: {
            ...campaign.brand,

            avatar: profile?.avatar || '',

            coverImage: profile?.coverImage || '',

            companyName:
              profile?.brandName ||
              campaign.brand.companyName ||
              campaign.brand.name,

            verified:
              profile?.verified || false
          }
        };
      })
    );

    res.json({
      success: true,
      campaigns
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
router.get('/brand/my', protect, authorize('brand'), async (req, res) => {
  try {
    const campaigns = await Campaign.find({ brand: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/application/:appId', protect, authorize('brand'), async (req, res) => {
  try {
    let incomingStatus = '';

    if (req.body && req.body.status) {
      if (typeof req.body.status === 'object' && req.body.status.status) {
        incomingStatus = req.body.status.status;
      } else if (typeof req.body.status === 'string') {
        incomingStatus = req.body.status;
      }
    }

    if (!incomingStatus) {
      return res.status(400).json({ success: false, message: 'Status field is missing or invalid.' });
    }

    const app = await Application.findOneAndUpdate(
      { _id: req.params.appId },
      { status: incomingStatus.toLowerCase() },
      { new: true }
    );
    
    if (!app) return res.status(404).json({ success: false, message: 'Application wrapper entity not found.' });

      // notify influencer about decision
    try {
      await notify(app.influencer, 'influencer', {
        type: 'application_status',
        urgent: incomingStatus.toLowerCase() === 'accepted',
        title: `Application ${incomingStatus}`,
        body: `Your application for "${app.campaign?.title || 'campaign'}" was ${incomingStatus}.`,
        meta: { applicationId: app._id, campaignId: app.campaign?._id, status: app.status },
      });
    } catch (e) { console.log('notify err', e.message); }


    const io = req.app.get('io');
    if (io) {
      io.emit('application_status_updated', {
        applicationId: app._id,
        status: app.status,
        influencerId: app.influencer,
        brandId: app.brand
      });
    }

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, authorize('brand'), upload.single('coverArt'), async (req, res) => {
  try {
    let coverArtUrl = '';

    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'vistafluence_campaigns',
      });
      coverArtUrl = uploadResponse.secure_url;
    } 
    else if (req.body.coverArt) {
      coverArtUrl = req.body.coverArt;
    } else if (req.body.coverArtUrl) {
      coverArtUrl = req.body.coverArtUrl;
    }

    let parsedDeliverables = [];
    if (req.body.deliverables) {
      try {
        parsedDeliverables = typeof req.body.deliverables === 'string' 
          ? JSON.parse(req.body.deliverables) 
          : req.body.deliverables;
      } catch (e) {
        if (typeof req.body.deliverables === 'string') {
          parsedDeliverables = req.body.deliverables.split(',').map(item => item.trim());
        }
      }
    }

    const campaignData = {
      title: req.body.title,
      description: req.body.description || 'No description provided.',
      budget: Number(req.body.budget) || 0,
      deadline: req.body.deadline || '30 May 2026',
      category: req.body.category || 'General',
      deliverables: parsedDeliverables,
      coverArt: coverArtUrl, 
      brand: req.user._id 
    };

    const campaign = await Campaign.create(campaignData);

    // notify influencers about new campaign
    try {
      await notifyRole('influencer', {
        type: 'campaign',
        urgent: false,
        title: 'New Campaign Available',
        body: `${req.user.companyName || req.user.name} posted "${campaign.title}" - Budget ₹${campaign.budget}`,
        meta: { campaignId: campaign._id, brandId: req.user._id },
      });
    } catch (e) { console.log('notify err', e.message); }

    res.status(201).json({ success: true, message: "Campaign deployed successfully!", campaign });
  } catch (err) {
    res.status(400).json({ success: false, message: "Validation or Engine error: " + err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('brand', 'name companyName avatar logo');
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, authorize('brand'), upload.single('coverArt'), async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
        folder: 'vistafluence_campaigns',
      });
      updateData.coverArt = uploadResponse.secure_url;
    }

    if (updateData.deliverables && typeof updateData.deliverables === 'string') {
      try { updateData.deliverables = JSON.parse(updateData.deliverables); } catch(e) {}
    }

    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, brand: req.user._id },
      updateData,
      { new: true }
    );
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign resource not found or unauthorized access.' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/apply', protect, authorize('influencer'), async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    const now = new Date();
    await syncSubscriptionState(user, now);

    const currentPlan = user.subscription?.plan || 'free';
    const isFreePlan = currentPlan === 'free';

    if (!isFreePlan && user.subscription?.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is not active. Please renew your plan to continue applying.',
      });
    }
    const limit = isFreePlan
      ? getMaxApplications(currentPlan)
      : user.subscription?.maxApplications ?? getMaxApplications(currentPlan);

    const used = user.subscription?.applicationsUsed ?? 0;

    if (used >= limit) {
      return res.status(403).json({
        success: false,
        message: isFreePlan
          ? `You've used your ${limit} free application(s) this month. Subscribe to a plan to apply to more.`
          : `You've reached your ${currentPlan} plan's limit of ${limit} applications this month. Please upgrade to apply to more.`,
      });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const existing = await Application.findOne({ campaign: req.params.id, influencer: user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already applied to this active pool.' });

  
    const application = await Application.create({
      campaign: req.params.id,
      influencer: user._id,
      brand: campaign.brand,
      coverNote: req.body.coverNote || 'Interested in collaboration!',
      proposedRate: req.body.proposedRate || '',
    });
    await User.findByIdAndUpdate(user._id, { $inc: { 'subscription.applicationsUsed': 1 } });
    await Campaign.findByIdAndUpdate(req.params.id, { $inc: { applicantsCount: 1 } });

    //  notify the brand
    try {
      await notify(campaign.brand, 'advertiser', {
        type: 'application',
        urgent: true,
        title: 'New Application',
        body: `${user.name} applied to "${campaign.title}"`,
        meta: {
          influencerId: user._id,
          campaignId: campaign._id,
          applicationId: application._id,
        },
      });
    } catch (e) { console.log('notify err', e.message); }
    
    res.status(201).json({ success: true, message: "Application submitted!", application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/:id/applicants', protect, authorize('brand'), async (req, res) => {
  try {
    const id = req.params.id.trim();
    const applications = await Application.find({ campaign: id })
      .populate('influencer', 'name niche avatar platforms ratePerPromotion bio');
    
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const isLiked = campaign.likes?.includes(req.user._id);
    if (isLiked) {
      campaign.likes = campaign.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      campaign.likes = campaign.likes || [];
      campaign.likes.push(req.user._id);
    }

    await campaign.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('campaign_liked', { 
        campaignId: campaign._id, 
        likedBy: campaign.likes 
      });
    }

    res.json({ success: true, likes: campaign.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/comment', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });

    const newComment = {
      user: {
        _id: req.user._id,
        name: req.user.name,
        companyName: req.user.companyName || '',
        avatar: req.user.avatar || '' 
      },
      text,
      createdAt: new Date()
    };

    campaign.comments = campaign.comments || [];
    campaign.comments.push(newComment);
    await campaign.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('campaign_commented', {
        campaignId: campaign._id,
        comment: newComment
      });
    }

    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;