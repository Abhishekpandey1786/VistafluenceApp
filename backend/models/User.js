const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["influencer", "brand", "admin"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    niche: String,
    platforms: [String],
    ratePerPromotion: Number,
    companyName: String,
    industry: String,
    budget: Number,
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: "",
    },
    subscription: {
      // "free" until the first successful payment activates a real plan.
      // After that, this becomes "Basic" | "Standard" | "Advanced" | "Premium"
      // (see planCodes/planNames in routes/instamojo.js).
      plan: {
        type: String,
        default: "free",
      },
      // Whether the plan is currently usable. Only "Active" subscriptions
      // are allowed to apply to campaigns — this is what routes/campaign.js
      // checks before letting someone apply.
      status: {
        type: String,
        enum: ["Active", "Expired", "None"],
        default: "None",
      },
      // How many campaign applications this plan allows per month.
      // Set from utils/planLimits.js -> getMaxApplications() when a
      // subscription is activated (routes/instamojo.js).
      maxApplications: {
        type: Number,
        default: 0,
      },
      applicationsUsed: {
        type: Number,
        default: 0,
      },
      lastResetDate: {
        type: Date,
        default: Date.now,
      },
      startDate: Date,
      // Use this field consistently everywhere (frontend reads
      // subscription.expiryDate) instead of the old "endDate" name.
      expiryDate: Date,
    },
    academyPassword: { type: String, default: null },
    academyAccess: { type: Boolean, default: false },
    academyAccessExpiresAt: { type: Date, default: null },
    academyPasswordIssuedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// No `next` parameter at all here on purpose. Mongoose has supported
// plain async pre-hooks (no callback needed) since v5 — you just return
// the promise and Mongoose awaits it. Mixing an async function with a
// next() callback is what caused issues before; this version sidesteps
// that entirely.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);