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
      plan: {
        type: String,
        default: "free",
      },
      status: {
        type: String,
        enum: ["Active", "Expired", "None"],
        default: "None",
      },
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
      expiryDate: Date,
    },
    academyPassword: { type: String, default: null },
    academyAccess: { type: Boolean, default: false },
    academyAccessExpiresAt: { type: Date, default: null },
    academyPasswordIssuedAt: { type: Date, default: null },
  },
  { timestamps: true },
);
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