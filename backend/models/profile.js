const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  email: { type: String, required: true, unique: true },

  role: {
    type: String,
    enum: ['brand', 'creator', 'influencer'],
    required: true,
  },

  name: { type: String, required: true },

  handle: String,
  website: String,
  phone: String,
  location: String,
  categories: String,
  bio: { type: String, default: 'No bio provided.' },
  avatar: String,
  coverImage: String, // NEW FIELD
  verified: { type: Boolean, default: false },

  username: String,
  followers: { type: Number, default: 0 },

  brandName: String,
  gst: String,
  totalSpent: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);