
import { SendMailOptions } from "nodemailer";
import transporter from "../config/emailConfig.js";
import User from "../models/userModel.js";
import dotenv from 'dotenv';

dotenv.config();

export function generateOTP(): number {
    return Math.floor(100000 + Math.random() * 900000);
}

export async function sendOTPEmail(email: string, otp: number): Promise<any> {
    try {
        const mailOptions: SendMailOptions = {
            from: `"Insert ChatApp" <${process.env.SMTP_USERNAME}>`,
            to: email,
            subject: "Your Email Verification OTP",
            text: `Your OTP for email verification is: ${otp}. This OTP will expire in 10 minutes.`,
            html: `<p>Your OTP for email verification is: <strong>${otp}</strong>. This OTP will expire in 10 minutes.</p>`
        };

 

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Failed to send email. SMTP Configuration:");
        console.error("SMTP User:", process.env.SMTP_USER);
        console.error("SMTP Password:", process.env.SMTP_PASSWORD ? 'Exists' : 'Missing');
        throw error;
    }
    
}

export async function cleanupFailedRegistration(userId: string): Promise<void> {
    try {
        if (userId) {
            await User.findByIdAndDelete(userId);
            console.log(`Cleaned up failed registration for user ID: ${userId}`);
        }
    } catch (error) {
        console.error("Error during registration cleanup:", error);
        throw error;
    }
}