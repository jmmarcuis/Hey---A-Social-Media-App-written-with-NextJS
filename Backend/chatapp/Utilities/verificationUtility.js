// verificationUtility.js
const transporter = require("../Config/emailConfig");
const User = require("../Models/userModel");  
require('dotenv').config();

// Generate 6 digit OTP password for verification
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Send an asynchronous function email to the recipient registration request
async function sendOTPEmail(email, otp) {
  try {
    let info = await transporter.sendMail({
      from: `"Inser ChatApp" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Your Email Verification OTP",
      text: `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`,
      html: `<p>Your OTP for email verification is: <strong>${otp}</strong>. This OTP will expire in 10 minutes.</p>`
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Rollback Function in case any problems in registrations occur
async function cleanupFailedRegistration(userId) {
    try {
        if (userId) {
            await User.findByIdAndDelete(userId);
            console.log(`Cleaned up failed registration for user ID: ${userId}`);
        }
    } catch (error) {
        console.error("Error during registration cleanup:", error);
        throw error; // Add this to propagate the error
    }
}

module.exports = {
    generateOTP,
    sendOTPEmail,
    cleanupFailedRegistration
};