const mongoose = require('mongoose');

const influencerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  email:    { type: String, required: true, unique: true },
  role:     { type: String, enum: ['influencer', 'creator'], default: 'influencer' },

  // ── Identity ──────────────────────────────────────────────────────────────
  name:     { type: String, required: true },
  username: { type: String, default: '' },
  handle:   { type: String, default: '' },

  // ── Media ─────────────────────────────────────────────────────────────────
  avatar:     { type: String, default: '' },
  coverImage: { type: String, default: '' },

  // ── Bio & Discovery ───────────────────────────────────────────────────────
  bio:        { type: String, default: 'No bio provided.' },
  location:   { type: String, default: '' },
  categories: { type: String, default: '' },
  website:    { type: String, default: '' },
  phone:      { type: String, default: '' },

  followers:  { type: String, default: '0' },
  engagement: { type: String, default: '0%' },
  perPost:    { type: String, default: '₹0' },

  instagramLink:      { type: String, default: '' },
  instagramFollowers: { type: String, default: '' },
  youtubeLink:        { type: String, default: '' },
  youtubeFollowers:   { type: String, default: '' },
  tiktokLink:         { type: String, default: '' },
  tiktokFollowers:    { type: String, default: '' },
  twitterLink:        { type: String, default: '' },
  twitterFollowers:   { type: String, default: '' },
  linkedinLink:       { type: String, default: '' },
  linkedinFollowers:  { type: String, default: '' },
  facebookLink:       { type: String, default: '' },
  facebookFollowers:  { type: String, default: '' },

  verified: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('InfluencerProfile', influencerProfileSchema);