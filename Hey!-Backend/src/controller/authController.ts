import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel.js';
import {
  generateOTP,
  sendOTPEmail,
  cleanupFailedRegistration,
} from '../utility/verificationUtility.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import chalk from 'chalk';

// Token Configuration
const TOKEN_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
};

// Token Generation Interfaces
interface TokenPayload {
  id: string;
  email: string;
  type: 'access' | 'refresh';
}


interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Enhanced Token Generation Functions
const generateTokens = (user: IUser): AuthTokens => {
  const accessTokenPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    type: 'access'
  };

  const refreshTokenPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    type: 'refresh'
  };

  const accessToken = jwt.sign(
    accessTokenPayload,
    TOKEN_CONFIG.ACCESS_TOKEN_SECRET,
    { expiresIn: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    TOKEN_CONFIG.REFRESH_TOKEN_SECRET,
    { expiresIn: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

// Token Storage and Management
const storeRefreshToken = async (user: IUser, refreshToken: string) => {
  // Store refresh token securely 
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({
    token: refreshToken,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Limit number of refresh tokens and remove expired ones
  user.refreshTokens = user.refreshTokens
    .filter(token => token.expiresAt > new Date())
    .slice(-5); // Keep only the last 5 refresh tokens

  await user.save();
};

const authController = {


  // Register Controller
  register: async (req: Request, res: Response): Promise<any> => {
    let user = null;

    try {
      const { username, email, password } = req.body;

      // Check for existing user
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const message =
          existingUser.email === email
            ? 'Email already in use'
            : 'Username already in use';
        return res.status(400).json({
          success: false,
          message,
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      user = new User({
        username,
        email,
        password: hashedPassword,
        verification: {
          isVerified: false,
          otp: {
            code: generateOTP().toString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        },
        registeredAt: new Date(),
        refreshTokens: [], // Initialize empty refresh tokens array
      });

      // Save the user
      await user.save();

      // Send OTP email
      if (user.verification.otp.code) {
        await sendOTPEmail(email, parseInt(user.verification.otp.code));
      } else {
        throw new Error('OTP code is null or undefined during email send operation');
      }

      // Generate tokens after user creation
      const { accessToken, refreshToken } = generateTokens(user);

      // Store the refresh token
      await storeRefreshToken(user, refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Check your email for the OTP to verify your account.',
        tokens: {
          accessToken,
          refreshToken
        },
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.verification.isVerified,
        },
      });
    } catch (error) {
      // Cleanup user if partially created
      if (user && user._id) {  // Add check for user._id
        try {
          await cleanupFailedRegistration(user._id.toString());
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }

      // Handle potential mongoose validation errors
      if (error instanceof Error) {
        console.error('Registration Error:', error.message);
        return res.status(500).json({
          success: false,
          message: error.message || 'An error occurred during registration. Please try again.',
        });
      }

      // Fallback for unexpected errors
      console.error('Unexpected error:', error);
      return res.status(500).json({
        success: false,
        message: 'An unexpected error occurred during registration. Please try again.',
      });
    }
  },

  // Verify Email Controller
  verifyEmail: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, otp } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });

      // Check if user exists
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if already verified
      if (user.verification.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
        });
      }

      // Check if OTP matches and is not expired
      if (user.verification.otp.code !== otp) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect/Expired OTP',
        });
      }

      // Check OTP expiration
      if (user.verification.otp.expiresAt && user.verification.otp.expiresAt < new Date()) {
        // Generate new OTP 
        user.verification.otp.code = generateOTP().toString();
        user.verification.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        // Send new OTP
        await sendOTPEmail(email, parseInt(user.verification.otp.code));

        return res.status(400).json({
          success: false,
          message: 'OTP expired. New OTP has been sent to your email.',
        });
      }

      // Mark user as verified
      user.verification.isVerified = true;

      // Clear OTP after successful verification
      user.verification.otp = {
        code: null,
        expiresAt: null
      };

      // Save the updated user
      await user.save();



      return res.status(200).json({
        success: true,
        message: 'Email verified successfully',

        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.verification.isVerified,
        },
      });
    } catch (error) {
      console.error('Email verification error', error);
      return res.status(500).json({
        success: false,
        message: 'Verification failed. Please try again.',
      });
    }
  },

  // Cancel Verification Controller
  cancelVerification: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.body;

      // Find the user by email
      const user = await User.findOne({ email }) as IUser | null;

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Only allow cancellation for unverified users
      if (user.verification.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel verification for already verified user'
        });
      }

      // Remove the user or mark as cancelled (depends on your requirements)
      await User.findByIdAndDelete(user._id);

      return res.status(200).json({
        success: true,
        message: 'Verification cancelled and registration deleted successfully'
      });
    } catch (error) {
      console.error('Verification cancellation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel verification. Please try again.'
      });
    }
  },

  // Resend OTP Controller
  resendOTP: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.verification.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      const otp = generateOTP();
      user.verification.otp.code = otp.toString();
      user.verification.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await user.save();

      await sendOTPEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: 'New OTP sent successfully'
      });
    } catch (error) {
      console.error('OTP resend error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error resending OTP. Please try again later.'
      });
    }
  },

  // Login Controller
  login: async (req: Request, res: Response): Promise<any> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error_code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      // Check if email is verified
      if (!user.verification.isVerified) {
        return res.status(403).json({
          success: false,
          error_code: 'EMAIL_NOT_VERIFIED',
          message: 'Email not verified. Please verify your email before logging in.',
        });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error_code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Save refresh token in the database
      user.refreshTokens.push({
        token: refreshToken,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      user.lastLogin = new Date();
      await user.save();

      // Respond with tokens and user info
      console.log(chalk.green('[DEBUG] LOGIN SUCCESSFUL'));
      return res.status(200).json({
        success: true,
        message: 'Login successful.',
        tokens: {
          accessToken,
          refreshToken,
        },
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profile?.profilePicture || '/default-avatar.png',
        },
      });
    } catch (error) {
      console.error(chalk.red('[ERROR] Login error:'), error);
      return res.status(500).json({
        success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Error logging in. Please try again later.',
      });
    }
  },

  // Verify Token Controller
  verifyToken: async (req: Request, res: Response): Promise<any> => {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Extract token
      const token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string,
        email: string
      };

      // Find user with decoded token data
      const user = await User.findOne({
        _id: decoded.id,
        email: decoded.email,
      }).select('-password -verification.otp'); // Exclude sensitive data

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or token invalid'
        });
      }

      // Check if user is still verified
      if (!user.verification.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'Account is not verified',
          code: 'UNVERIFIED_ACCOUNT',
        });
      }

      // Debug
      console.log(chalk.green('[DEBUG] VERIFY SUCCESSFUL'));

      // Update last activity
      user.lastActive = new Date();
      await user.save();

      // Return success with user data
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          isVerified: user.verification.isVerified,
        },
      });
      // ! IF THIS SHOWS UP YOU ARE STUPID AND RETARDED 
    } catch (error) {
      console.error('Token verification error:', error);

      // Handle specific JWT errors
      if (error instanceof jwt.JsonWebTokenError) {
        console.log(chalk.red('[DEBUG FROM VERIFY TOKEN CONTROLLER] INVALID TOKEN'));
        return res.status(401).json({
          success: false,
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        });
      } else if (error instanceof jwt.TokenExpiredError) {
        console.log(chalk.red('[DEBUG FROM VERIFY TOKEN CONTROLLER] EXPIRED TOKEN'));
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED',
        });
      }

      // Handle other errors
      return res.status(500).json({
        success: false,
        message: 'Error verifying token',
        code: 'VERIFICATION_ERROR',
      });
    }
  },

  // Token Refresh Controller
  refreshToken: async (req: Request, res: Response): Promise<any> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        TOKEN_CONFIG.REFRESH_TOKEN_SECRET
      ) as TokenPayload;

      // Find user and check if refresh token is valid
      const user = await User.findOne({
        _id: decoded.id,
        email: decoded.email
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Check if refresh token is in user's stored tokens
      const storedTokenExists = user.refreshTokens.some(
        token => token.token === refreshToken
      );

      if (!storedTokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has been invalidated'
        });
      }

      // Generate new tokens
      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      } = generateTokens(user);

      // Store new refresh token
      await storeRefreshToken(user, newRefreshToken);

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });

      // ! IF THIS SHOWS UP YOU ARE STUPID AND RETARDED 
    } catch (error) {
      console.error('Token refresh error:', error);

      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error refreshing token'
      });
    }
  },

  // Logout Controller (Invalidate Tokens)
  logout: async (req: Request, res: Response): Promise<any> => {
    try {
      const { refreshToken } = req.body;
      const user = req.user as IUser;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Remove specific refresh token
      user.refreshTokens = user.refreshTokens.filter(
        token => token.token !== refreshToken
      );

      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error during logout'
      });
    }
  },


};

export default authController;