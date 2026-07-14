const PLAN_LIMITS = {
  Basic: 6,
  Standard: 15,
  Advanced: 40,
  Premium: 9999,
};

const DEFAULT_LIMIT = 1;

function getMaxApplications(plan) {
  return PLAN_LIMITS[plan] ?? DEFAULT_LIMIT;
}

function isSubscriptionExpired(subscription, now = new Date()) {
  return !!(subscription?.expiryDate && new Date(subscription.expiryDate) < now);
}

async function syncSubscriptionState(user, now = new Date()) {
  const sub = user.subscription;
  if (!sub) return user;

  if (sub.status === 'Active' && isSubscriptionExpired(sub, now)) {
    sub.plan = 'free';
    sub.status = 'None';
    sub.maxApplications = 0; // free-tier limit is derived from getMaxApplications('free') at check time
    sub.applicationsUsed = 0;
    sub.lastResetDate = now;
    await user.save();
    return user;
  }

  if (sub.lastResetDate) {
    const last = new Date(sub.lastResetDate);
    const rolledOverToNewMonth =
      last.getFullYear() !== now.getFullYear() || last.getMonth() !== now.getMonth();

    if (rolledOverToNewMonth) {
      sub.applicationsUsed = 0;
      sub.lastResetDate = now;
      await user.save();
    }
  }

  return user;
}

module.exports = {
  PLAN_LIMITS,
  DEFAULT_LIMIT,
  getMaxApplications,
  isSubscriptionExpired,
  syncSubscriptionState,
};