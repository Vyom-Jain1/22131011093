const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    referrer: {
      type: String,
      default: "direct",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    location: {
      country: {
        type: String,
        default: "unknown",
      },
      city: {
        type: String,
        default: "unknown",
      },
      region: {
        type: String,
        default: "unknown",
      },
    },
  },
  { _id: false }
);

const urlSchema = new mongoose.Schema(
  {
    originalUrl: {
      type: String,
      required: [true, "Original URL is required"],
      trim: true,
      validate: {
        validator: function (url) {
          try {
            new URL(url);
            return true;
          } catch (error) {
            return false;
          }
        },
        message: "Invalid URL format",
      },
    },
    shortCode: {
      type: String,
      required: [true, "Short code is required"],
      unique: true,
      trim: true,
      minlength: [3, "Short code must be at least 3 characters"],
      maxlength: [20, "Short code cannot exceed 20 characters"],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        "Short code can only contain letters, numbers, hyphens, and underscores",
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    clicks: [clickSchema],
    totalClicks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      default: "anonymous",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for short URL
urlSchema.virtual("shortUrl").get(function () {
  return `${process.env.BASE_URL || "http://localhost:5000"}/${this.shortCode}`;
});

// Virtual for time remaining
urlSchema.virtual("timeRemaining").get(function () {
  if (!this.expiresAt) return null;
  const now = new Date();
  const remaining = this.expiresAt.getTime() - now.getTime();
  return remaining > 0 ? remaining : 0;
});

// Virtual for isExpired
urlSchema.virtual("isExpired").get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Pre-save middleware to update total clicks
urlSchema.pre("save", function (next) {
  this.totalClicks = this.clicks.length;
  next();
});

// Index for better query performance
urlSchema.index({ shortCode: 1 });
urlSchema.index({ createdAt: -1 });
urlSchema.index({ expiresAt: 1 });
urlSchema.index({ isActive: 1 });

// Static method to find active URLs
urlSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });
};

// Instance method to add click
urlSchema.methods.addClick = function (clickData) {
  this.clicks.push(clickData);
  this.totalClicks = this.clicks.length;
  return this.save();
};

// Instance method to check if URL is valid
urlSchema.methods.isValid = function () {
  return this.isActive && !this.isExpired;
};

module.exports = mongoose.model("Url", urlSchema);
