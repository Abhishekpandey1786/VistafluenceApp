const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  budget: {
    type: Number,
    required: true
  },
  deadline: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true
  },
  deliverables: {
    type: [String],
    default: []
  },
  coverArt: {
    type: String,
    default: ''
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused'],
    default: 'active'
  },
  applicantsCount: {
    type: Number,
    default: 0
  },

  // ─── 🔥 REAL-TIME ENGINES FIELDS (LIKES & COMMENTS) ──────────────────

  // 1. Likes: इसमें उन सभी Users की ObjectIds स्टोर होंगी जिन्होंने लाइक किया है
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },

  // 2. Comments: इसमें कमेंट करने वाले का नाम, कंपनी नेम, अवतार, टेक्स्ट और टाइमस्टैम्प स्टोर होगा
  comments: {
    type: [{
      user: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        companyName: { type: String, default: '' },
        avatar: { type: String, default: '' } // 🔥 यहाँ यूजर की प्रोफाइल फोटो (Cloudinary URL) स्टोर होगी
      },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    default: []
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Campaign', CampaignSchema);