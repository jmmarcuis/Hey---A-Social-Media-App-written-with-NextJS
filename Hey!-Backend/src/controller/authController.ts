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

// Helper function to generate token
const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: '1h' }
  );
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
          code: generateOTP().toString(), // Convert to string for consistency
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // OTP valid for 10 mins
        },
      },
      registeredAt: new Date(),
    });

    if (!user || !user.verification.otp.code) {  // Add null check for otp.code
      return res.status(404).json({ 
        success: false,
        message: 'User not found or OTP not set' 
      });
    }

    // Save the user
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, parseInt(user.verification.otp.code));
    // Generate JWT Token
    const token = generateToken(user);

    // Return success response
    return res.status(201).json({
      success: true,
      message:
        'Registration successful. Check your email for the OTP to verify your account.',
      token,
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
      code: null,  // Use null instead of undefined
      expiresAt: null  // Use null instead of undefined
    };


    // Save the updated user
    await user.save();

    // Generate token
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      token,
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

    // Clean up the failed registration
    // await cleanupFailedRegistration(user._id);

    return res.status(200).json({
      success: true,
      message: 'Verification cancelled and registration cleaned up successfully'
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
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.verification.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
      });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(chalk.green('[DEBUG] LOGIN SUCCESSFUL'));

    // Respond with token and user info
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error logging in. Please try again later.' 
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
  } catch (error) {
    console.error('Token verification error:', error);

    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      console.log(chalk.red('[DEBUG] INVALID TOKEN'));
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log(chalk.red('[DEBUG] EXPIRED TOKEN'));
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
}
};

export default authController;