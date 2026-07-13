const mongoose = require('mongoose');
const NotificationSchema = new mongoose.Schema({
  recipientId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recipientRole: { type: String, enum: ['influencer','advertiser'], required: true },
  type:    { type: String, enum: ['application','application_status','payment','campaign','message','accepted','admin'], required: true },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  urgent:  { type: Boolean, default: false },
  read:    { type: Boolean, default: false },
  meta:    { type: Object, default: {} },
}, { timestamps: true });
module.exports = mongoose.model('Notification', NotificationSchema);