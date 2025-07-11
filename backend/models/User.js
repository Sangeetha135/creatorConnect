const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
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
    role: {
      type: String,
      enum: ["brand", "influencer"],
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Number,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    verificationExpiry: {
      type: Date,
    },
    // Enhanced social media data
    socialMedia: {
      youtube: {
        channelId: String,
        title: String,
        subscribers: Number,
        totalViews: Number,
        averageViews: Number,
        videoCount: Number,
        lastUpdated: Date,
        recentVideos: [
          {
            videoId: String,
            title: String,
            views: Number,
            publishedAt: Date,
          },
        ],
      },
      instagram: {
        username: String,
        followers: Number,
        following: Number,
        posts: Number,
        engagementRate: Number,
        lastUpdated: Date,
        recentPosts: [
          {
            postId: String,
            caption: String,
            likes: Number,
            comments: Number,
            postedAt: Date,
          },
        ],
      },
      tiktok: {
        username: String,
        followers: Number,
        following: Number,
        likes: Number,
        videoCount: Number,
        lastUpdated: Date,
        recentVideos: [
          {
            videoId: String,
            description: String,
            likes: Number,
            comments: Number,
            shares: Number,
            postedAt: Date,
          },
        ],
      },
    },
    // Analytics data
    analytics: {
      totalCampaigns: {
        type: Number,
        default: 0,
      },
      completedCampaigns: {
        type: Number,
        default: 0,
      },
      totalEarnings: {
        type: Number,
        default: 0,
      },
      averageEngagementRate: {
        type: Number,
        default: 0,
      },
      topPerformingContent: [
        {
          platform: String,
          contentId: String,
          title: String,
          engagement: Number,
          date: Date,
        },
      ],
      monthlyStats: [
        {
          month: Date,
          views: Number,
          engagement: Number,
          earnings: Number,
        },
      ],
    },
    profileComplete: {
      type: Boolean,
      default: false,
    },
    profilePictureUrl: String,
    bio: String,
    location: { type: String, default: "Hyderabad" },
    categories: [String],
    languages: [String],
    preferredContentTypes: [String],
    averageResponseTime: Number,
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
