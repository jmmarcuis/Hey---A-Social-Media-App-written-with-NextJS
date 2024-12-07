const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// User Schema - Main structure for user data
const UserSchema = new Schema(
  {
    // Basic Authentication Fields
    username: {
      type: String,
      required: true,
      unique: true,      // Ensures no duplicate usernames
      trim: true,        // Removes whitespace from both ends
      minlength: 3,      // Minimum 3 characters
      maxlength: 20,     // Maximum 20 characters
    },
    email: {
      type: String,
      required: true,
      unique: true,      // Ensures no duplicate emails
      lowercase: true,   // Converts email to lowercase
      trim: true,        // Removes whitespace
      match: [          // Regex pattern for email validation
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      index: true,      // Creates an index for faster queries
    },
    password: {
      type: String,
      required: true,
      minlength: 8,     // Minimum password length for security
    },

    // Email Verification System
    verification: {
      isVerified: {
        type: Boolean,
        default: false,  // User starts as unverified
      },
      otp: {
        code: String,    // One-time password for verification
        expiresAt: Date, // OTP expiration timestamp
      },
    },

    // User Profile Information
    profile: {
      firstName: {
        type: String,
        trim: true,
      },
      lastName: {
        type: String,
        trim: true,
      },
      bio: {
        type: String,
        maxlength: 500,  // Limit bio to 500 characters
      },
      profilePicture: {
        type: String,
        default: "/default-avatar.png", // Default profile picture path
      },
      coverPicture: {
        type: String,
        default: "/default-cover.png",  // Default cover picture path
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"], // Restricted gender options
      },
      dateOfBirth: {
        type: Date,
      },
    },

    // Social Connections
    social: {
      friends: [{
        user: {
          type: Schema.Types.ObjectId,  // Reference to another user
          ref: "Users",                 // References the Users collection
        },
        status: {
          type: String,
          enum: ["pending", "accepted"], // Friend request status
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,            // Timestamp when friendship was initiated
        },
      }],
      blocked: [{
        user: {
          type: Schema.Types.ObjectId,  // Reference to blocked user
          ref: "Users",
        },
        createdAt: {
          type: Date,
          default: Date.now,            // Timestamp when user was blocked
        },
      }],
    },

    // User Statistics
    stats: {
      postsCount: {
        type: Number,
        default: 0,      // Counter for user's posts
      },
      friendsCount: {
        type: Number,
        default: 0,      // Counter for user's friends
      },
    },

    // Activity Tracking
    lastActive: {
      type: Date,        // Last user activity timestamp
    },
    registeredAt: {
      type: Date,
      default: Date.now, // Account creation timestamp
    },
    lastLogin: {
      type: Date,        // Last login timestamp
    },
  },
  {
    timestamps: true,    // Automatically adds createdAt and updatedAt fields
  }
);

// Database Indexes for Optimization
UserSchema.index({ "profile.firstName": 1, "profile.lastName": 1 });  // Index for name searches
UserSchema.index({ status: 1 });                                      // Index for status queries
UserSchema.index({ "social.friends.status": 1 });                     // Index for friend status queries

// Export the model
module.exports = mongoose.model("Users", UserSchema);