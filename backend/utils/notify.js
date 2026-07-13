const Notification = require('../models/Notification');
const User = require('../models/User');

// User model mein 'brand' hai, Notification model mein 'advertiser' chahiye
function toNotifRole(role) {
  if (role === 'brand' || role === 'advertiser') return 'advertiser';
  if (role === 'influencer') return 'influencer';
  return null;
}

// Single user ko notify karo
async function notify(userId, role, payload) {
  const recipientRole = toNotifRole(role);
  if (!recipientRole) return;

  await Notification.create({
    recipientId: userId,
    recipientRole,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    urgent: payload.urgent || false,
    meta: payload.meta || {},
  });
}

// Poori role category ko notify karo
async function notifyRole(role, payload) {
  // User DB mein dhundho
  const dbRole = (role === 'advertiser') ? 'brand' : role;
  // Notification mein save karo
  const recipientRole = toNotifRole(role);
  if (!recipientRole) return;

  const users = await User.find({ 
    role: dbRole, 
    isBanned: { $ne: true } 
  }).select('_id');

  if (!users.length) return;

  const notifications = users.map(u => ({
    recipientId: u._id,
    recipientRole,
    type: payload.type,
    title: payload.title,
    body: payload.body,
    urgent: payload.urgent || false,
    meta: payload.meta || {},
  }));

  await Notification.insertMany(notifications);
}

module.exports = { notify, notifyRole };