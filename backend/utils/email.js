const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  }
});

// Fallback transporter using different settings if the first one fails
const createFallbackTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Verify SMTP connection configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (primaryError) {
    // Try fallback configuration
    try {
      transporter = createFallbackTransporter();
      await transporter.verify();
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
};

const sendVerificationEmail = async (email, code) => {
  try {
    // First verify the connection
    const isConfigValid = await verifyEmailConfig();
    if (!isConfigValid) {
      return false;
    }

    const mailOptions = {
      from: `"Influencer Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2196f3; text-align: center;">Welcome to Influencer Platform!</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="text-align: center; margin-bottom: 20px;">Your Verification Code:</h3>
                        <div style="background-color: #ffffff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 5px;">
                            ${code}
                        </div>
                    </div>
                    <p style="color: #666; text-align: center;">This code will expire in 10 minutes.</p>
                    <p style="color: #666; text-align: center;">If you didn't request this verification, please ignore this email.</p>
                </div>
            `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #FF0000;">Password Reset</h2>
                    <p>You have requested to reset your password. Click the link below to proceed:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="${resetUrl}" style="background-color: #FF0000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    </div>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                </div>
            `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  verifyEmailConfig,
  sendPasswordResetEmail
}; 