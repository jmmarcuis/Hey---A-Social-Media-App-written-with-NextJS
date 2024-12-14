// emailConfig.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
  },
});

export default transporter;
