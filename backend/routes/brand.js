const express = require('express');
const router = express.Router();

const Profile = require('../models/profile');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

const { protect } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2; 

// GET PROFILE
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    let currentProfile = await Profile.findOne({ user: userId });

    if (!currentProfile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      currentProfile = await Profile.create({
        user: userId,
        email: user.email,
        role: user.role,
        name: user.name,
        handle: '',
        website: '',
        phone: '',
        location: '',
        categories: '',
        bio: 'No bio provided.',
        avatar: '',
        coverImage: '', 
        verified: false,
        username: user.role === 'influencer' ? user.name : '',
        followers: 0,
        brandName: user.role === 'brand' ? (user.companyName || user.name) : '',
        gst: '',
        totalSpent: 0,
      });
    }

    const isBrand = currentProfile.role === 'brand';

    let additionalData = {};

    if (isBrand) {
      const activeCampaigns = await Campaign.find({
        brand: userId,
        status: 'active',
      });

      let calculatedApplicants = 0;
      let calculatedTotalSpent = 0;

      activeCampaigns.forEach(c => {
        calculatedApplicants += c.applicants?.length || c.applicantsCount || 0;
        calculatedTotalSpent += Number(c.budget) || 0;
      });

      additionalData = {
        campaignsCount: activeCampaigns.length,
        applicantsCount: calculatedApplicants, 
        totalSpent: `₹${(calculatedTotalSpent / 100000).toFixed(1)}L`,

        campaignsData: activeCampaigns.map(c => ({
          icon: '📢',
          color: '#D4AF37',
          name: c.title,
          sub: `Budget ₹${c.budget || 0}`,
          val: c.applicants?.length || c.applicantsCount || 0, 
          status: 'Active',
          statusColor: '#22c55e',
        })),
      };
    } else {
      additionalData = {
        followers: '48K',
        engagement: '6.2%',
        perPost: '₹8K',

        channelsData: [
          {
            icon: '📸',
            color: '#E1306C',
            name: 'Instagram',
            sub:
              currentProfile.handle ||
              `@${currentProfile.username || currentProfile.name}`,
            val: '32K',
            status: 'Connected',
            statusColor: '#22c55e',
          },
          {
            icon: '▶️',
            color: '#FF0000',
            name: 'YouTube',
            sub: `${currentProfile.name} Vlogs`,
            val: '16K',
            status: 'Connected',
            statusColor: '#22c55e',
          },
        ],
      };
    }

    res.json({
      success: true,
      role: currentProfile.role,

      profile: {
        _id: currentProfile._id,

        username:
          currentProfile.username ||
          currentProfile.name,

        brandName:
          currentProfile.brandName ||
          currentProfile.name,

        handle: currentProfile.handle || '',
        email: currentProfile.email || '',
        website: currentProfile.website || '',
        phone: currentProfile.phone || '',
        location: currentProfile.location || '',
        categories:
          currentProfile.categories ||
          (isBrand
            ? 'Beauty, Skincare, Wellness, Lifestyle'
            : 'Fashion, Lifestyle, Beauty, Travel'),

        bio:
          currentProfile.bio ||
          'No bio provided yet.',

        gst: currentProfile.gst || '',

        verified:
          currentProfile.verified || false,

        avatar: currentProfile.avatar || '', 
        coverImage: currentProfile.coverImage || '', 

        ...additionalData,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      username,
      brandName,
      handle,
      email,
      website,
      phone,
      location,
      categories,
      bio,
      gst,
      avatar, 
      coverImage, 
    } = req.body;

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      profile = await Profile.create({
        user: userId,
        email: user.email,
        role: user.role,
        name: user.name,
        handle: '',
        website: '',
        phone: '',
        location: '',
        categories: '',
        bio: 'No bio provided.',
        avatar: '',
        coverImage: '', 
        verified: false,
        username: user.role === 'influencer' ? user.name : '',
        followers: 0,
        brandName: user.role === 'brand' ? (user.companyName || user.name) : '',
        gst: '',
        totalSpent: 0,
      });
    }

    if (profile.role === 'brand') {
      if (brandName !== undefined) {
        profile.brandName = brandName;
        profile.name = brandName;
      }
      if (gst !== undefined) {
        profile.gst = gst;
      }
    } else {
      if (username !== undefined) {
        profile.username = username;
        profile.name = username;
      }
    }

    if (handle !== undefined)     profile.handle = handle;
    if (email !== undefined)      profile.email = email;
    if (website !== undefined)    profile.website = website;
    if (phone !== undefined)      profile.phone = phone;
    if (location !== undefined)   profile.location = location;
    if (categories !== undefined) profile.categories = categories;
    if (bio !== undefined)        profile.bio = bio;

    
    if (avatar !== undefined) {
      if (avatar.startsWith('data:image')) {
        
        const uploadRes = await cloudinary.uploader.upload(avatar, {
          folder: 'vistafluence_profiles/avatars',
        });
        profile.avatar = uploadRes.secure_url;
      } else {
        profile.avatar = avatar;
      }
    }
    if (coverImage !== undefined) {
      if (coverImage.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(coverImage, {
          folder: 'vistafluence_profiles/covers',
        });
        profile.coverImage = uploadRes.secure_url;
      } else {
        profile.coverImage = coverImage;
      }
    }

    const updatedProfile = await profile.save();

    const isBrand = updatedProfile.role === 'brand';
    let additionalData = {};

    if (isBrand) {
      const activeCampaigns = await Campaign.find({
        brand: userId,
        status: 'active',
      });

      // 🌟 यहाँ पर भी असली डेटा कैलकुलेट हो रहा है
      let calculatedApplicants = 0;
      let calculatedTotalSpent = 0;

      activeCampaigns.forEach(c => {
        calculatedApplicants += c.applicants?.length || c.applicantsCount || 0;
        calculatedTotalSpent += Number(c.budget) || 0;
      });

      additionalData = {
        campaignsCount: activeCampaigns.length,
        applicantsCount: calculatedApplicants,
        totalSpent: `₹${(calculatedTotalSpent / 100000).toFixed(1)}L`,
        campaignsData: activeCampaigns.map(c => ({
          icon: '📢',
          color: '#D4AF37',
          name: c.title,
          sub: `Budget ₹${c.budget || 0}`,
          val: c.applicants?.length || c.applicantsCount || 0,
          status: 'Active',
          statusColor: '#22c55e',
        })),
      };
    } else {
      additionalData = {
        followers: '48K',
        engagement: '6.2%',
        perPost: '₹8K',
        channelsData: [
          {
            icon: '📸',
            color: '#E1306C',
            name: 'Instagram',
            sub: updatedProfile.handle || `@${updatedProfile.username || updatedProfile.name}`,
            val: '32K',
            status: 'Connected',
            statusColor: '#22c55e',
          },
          {
            icon: '▶️',
            color: '#FF0000',
            name: 'YouTube',
            sub: `${updatedProfile.name} Vlogs`,
            val: '16K',
            status: 'Connected',
            statusColor: '#22c55e',
          },
        ],
      };
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',

      profile: {
        username:
          updatedProfile.username ||
          updatedProfile.name,

        brandName:
          updatedProfile.brandName ||
          updatedProfile.name,

        handle:     updatedProfile.handle,
        email:      updatedProfile.email,
        website:    updatedProfile.website,
        phone:      updatedProfile.phone,
        location:   updatedProfile.location,
        categories: updatedProfile.categories,
        bio:        updatedProfile.bio,
        gst:        updatedProfile.gst || '',
        verified:   updatedProfile.verified || false,
        avatar:     updatedProfile.avatar || '', 
        coverImage: updatedProfile.coverImage || '', 
        ...additionalData,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// PUBLIC BRAND PROFILE
router.get('/:brandId', protect, async (req, res) => {
  try {
    const { brandId } = req.params;

    const brandProfile = await Profile.findOne({ user: brandId });

    if (!brandProfile || brandProfile.role !== 'brand') {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    const activeCampaigns = await Campaign.find({
      brand: brandId,
      status: 'active',
    }).select(
      'title budget minFollowers tags deadline applicants applicantsCount'
    );

    const categories =
      brandProfile.categories ||
      'Beauty, Skincare, Wellness, Lifestyle';

    // असली एप्लिकेंट्स और स्पेंट बजट कैलकुलेशन
    let calculatedApplicants = 0;
    let calculatedTotalSpent = 0;

    activeCampaigns.forEach(c => {
      calculatedApplicants += c.applicants?.length || c.applicantsCount || 0;
      calculatedTotalSpent += Number(c.budget) || 0;
    });

    res.json({
      success: true,

      brand: {
        _id:       brandProfile._id,
        name:      brandProfile.name,
        handle:    brandProfile.handle,
        verified:  brandProfile.verified || false,
        location:  brandProfile.location || '',
        email:     brandProfile.email || '',
        website:   brandProfile.website || '',
        phone:     brandProfile.phone || '',
        category:  categories,
        
        // 🌟 अब ब्रांड की असली प्रोफाइल पिक्चर (Avatar) जाएगी
        avatar:    brandProfile.avatar || '', 
        coverImage: brandProfile.coverImage || '', 

        // 🌟 यहाँ ब्रांड का असली डिस्क्रिप्शन (Bio) मैप हो गया है
        about:
          brandProfile.bio ||
          'No description provided.',

        initial:
          brandProfile.name?.charAt(0).toUpperCase() || 'B',

        color: '#D4AF37',

        stats: [
          { label: 'Campaigns',   value: activeCampaigns.length },
          { label: 'Applicants',  value: calculatedApplicants }, 
          { label: 'Total Spent', value: `₹${(calculatedTotalSpent / 100000).toFixed(1)}L` }, 
        ],

        activeCampaigns: activeCampaigns.map(c => ({
          _id:          c._id,
          title:        c.title,
          budget:       c.budget,
          minFollowers: c.minFollowers || '10K',
          tags:         c.tags || categories.split(',').map(t => t.trim()),
          deadline:     c.deadline,
          applicants:   c.applicants?.length || c.applicantsCount || 0, 
        })),

        reviews: brandProfile.reviews || []
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;