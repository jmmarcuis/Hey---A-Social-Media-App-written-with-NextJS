// models/userModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Define interfaces for nested structures
interface Verification {
  isVerified: boolean;
  otp: {
    code: string | null;
    expiresAt: Date | null;
  };
}

interface Profile {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture: string;
  coverPicture: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
}

interface Friend {
  user: Schema.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

interface BlockedUser {
  user: Schema.Types.ObjectId;
  createdAt: Date;
}

interface Social {
  friends: Friend[];
  blocked: BlockedUser[];
}

interface Stats {
  postsCount: number;
  friendsCount: number;
}

// Main User interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  verification: Verification;
  profile: Profile;
  social: Social;
  stats: Stats;
  lastActive?: Date;
  registeredAt: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    verification: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      otp: {
        code: String,
        expiresAt: Date,
      },
    },
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
        maxlength: 500,
      },
      profilePicture: {
        type: String,
        default: "/default-avatar.png",
      },
      coverPicture: {
        type: String,
        default: "/default-cover.png",
      },
      gender: {
        type: String,
        enum: ["male", "female", "other"],
      },
      dateOfBirth: {
        type: Date,
      },
    },
    social: {
      friends: [{
        user: {
          type: Schema.Types.ObjectId,
          ref: "Users",
        },
        status: {
          type: String,
          enum: ["pending", "accepted"],
          default: "pending",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      blocked: [{
        user: {
          type: Schema.Types.ObjectId,
          ref: "Users",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    stats: {
      postsCount: {
        type: Number,
        default: 0,
      },
      friendsCount: {
        type: Number,
        default: 0,
      },
    },
    lastActive: {
      type: Date,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ "profile.firstName": 1, "profile.lastName": 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ "social.friends.status": 1 });

export default mongoose.model<IUser>("Users", UserSchema);