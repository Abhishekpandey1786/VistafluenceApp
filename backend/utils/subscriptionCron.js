const cron = require('node-cron');
const User = require('../models/User');
async function expireOverdueSubscriptions() {
  const now = new Date();

  const result = await User.updateMany(
    {
      'subscription.status': 'Active',
      'subscription.expiryDate': { $lt: now },
    },
    {
      $set: {
        'subscription.plan': 'free',
        'subscription.status': 'None',
        'subscription.maxApplications': 0,
        'subscription.applicationsUsed': 0,
        'subscription.lastResetDate': now,
      },
    }
  );

  if (result.modifiedCount > 0) {
    console.log(`⏰ Subscription cron: downgraded ${result.modifiedCount} expired subscription(s) to free`);
  }

  return result.modifiedCount;
}

function startSubscriptionExpiryCron() {
  cron.schedule('5 0 * * *', () => {
    expireOverdueSubscriptions().catch((err) => {
      console.error('❌ Subscription expiry cron failed:', err);
    });
  });

  console.log('✅ Subscription expiry cron scheduled (daily at 00:05)');

  expireOverdueSubscriptions().catch((err) => {
    console.error('❌ Initial subscription expiry check failed:', err);
  });
}

module.exports = { expireOverdueSubscriptions, startSubscriptionExpiryCron };