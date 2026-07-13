const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🚨 YAHA CHANGE KIYA: String missing crash pipeline fallback logic handle ki
    coverNote: {
      type: String,
      default: "Interested in collaboration!",
      required: [true, "Pitch statement/cover note context registration required."]
    },

    proposedRate: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      lowercase: true
    }
  },
  { timestamps: true }
);

applicationSchema.index({ campaign: 1, influencer: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);