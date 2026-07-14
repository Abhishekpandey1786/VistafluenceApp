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

module.exports = { PLAN_LIMITS, DEFAULT_LIMIT, getMaxApplications };