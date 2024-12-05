const User = require("../Models/userModel");
const {
  generateOTP,
  sendOTPEmail,
  cleanupFailedRegistration,
} = require("../Utilities/verificationUtility");
const axios = require("axios");
const jwt = require("jsonwebtoken");
 
// Register Function
exports.register = async (req, res) => {
  let savedUser = null;

  try {
    const {
      profile: { firstName, lastName },
      username,
      email,
      password,
      dateOfBirth,
    } = req.body;

    // Input validation
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !dateOfBirth
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing user by email or username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: "Email already in use" });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already in use" });
      }
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName,
        dateOfBirth,
        profilePicture:
          "https://res.cloudinary.com/drf4qnjow/image/upload/v1728341592/profile_pictures/placeholder.jpg",
      },
    });

    // Generate OTP and assign to user
    const otp = generateOTP();
    user.verification.otp.code = otp;
    user.verification.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save the user
    savedUser = await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      // Rollback on email failure
      await cleanupFailedRegistration(savedUser._id);
      throw new Error(
        "Failed to send verification email. Registration cancelled."
      );
    }

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for the OTP to verify your account",
    });
  } catch (error) {
    // Rollback on any error
    if (savedUser) {
      try {
        await cleanupFailedRegistration(savedUser._id);
      } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message || "Registration failed. Please try again.",
    });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Input validation
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches and is not expired
    if (
      user.verification.otp.code !== otp ||
      user.verification.otp.expiresAt < new Date()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    user.verification.isVerified = true;

    // Clear OTP after successful verification
    user.verification.otp.code = undefined;
    user.verification.otp.expiresAt = undefined;

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error", error);
    res.status(500).json({
      success: false,
      message: "Verification failed. Please try again.",
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Input validation
    if (!email) {
      // Check for email, not user
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }); // Correct initialization of 'user'

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verification.isVerified) {
      // Use 'user.verification.isVerified'
      return res.status(400).json({ message: "Email is already verified" });
    }

    const otp = generateOTP();
    user.verification.otp.code = otp;
    user.verification.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("OTP resend error:", error);
    res
      .status(500)
      .json({ message: "Error resending OTP. Please try again later." });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if email is verified
    if (!user.verification.isVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email before logging in.",
      });
    }

    // Check password (direct comparison without hashing)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Respond with token and user info
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Error logging in. Please try again later." });
  }
};
