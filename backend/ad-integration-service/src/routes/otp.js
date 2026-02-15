const express = require('express');
const router = express.Router();
const EmailService = require('../services/email-service');

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

class OTPController {
    constructor() {
        this.emailService = new EmailService();
    }

    // Generate 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Store OTP with expiry
    storeOTP(email, otp) {
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        otpStore.set(email, {
            otp: otp,
            expiry: expiry,
            attempts: 0
        });
        
        console.log(`OTP stored for ${email}: ${otp}, expires at: ${expiry}`);
    }

    // Verify OTP
    verifyOTP(email, providedOTP) {
        const storedData = otpStore.get(email);
        
        if (!storedData) {
            return { valid: false, message: 'No OTP found for this email' };
        }

        // Check expiry
        if (new Date() > storedData.expiry) {
            otpStore.delete(email);
            return { valid: false, message: 'OTP has expired' };
        }

        // Check attempts (max 3 attempts)
        if (storedData.attempts >= 3) {
            otpStore.delete(email);
            return { valid: false, message: 'Too many failed attempts. Please request new OTP' };
        }

        // Verify OTP
        if (storedData.otp !== providedOTP) {
            storedData.attempts++;
            return { valid: false, message: 'Invalid OTP', attempts: 3 - storedData.attempts };
        }

        // OTP is valid - remove it
        otpStore.delete(email);
        return { valid: true, message: 'OTP verified successfully' };
    }

    // Clean expired OTPs (run periodically)
    cleanExpiredOTPs() {
        const now = new Date();
        for (const [email, data] of otpStore.entries()) {
            if (now > data.expiry) {
                otpStore.delete(email);
            }
        }
    }
}

const otpController = new OTPController();

// Send OTP endpoint
router.post('/send', async (req, res) => {
    try {
        const { email, userName } = req.body;

        // Validate input
        if (!email || !userName) {
            return res.status(400).json({
                success: false,
                message: 'Email and userName are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Generate and store OTP
        const otp = otpController.generateOTP();
        otpController.storeOTP(email, otp);

        // Send OTP email
        const emailResult = await otpController.emailService.sendOTPEmail(email, otp, userName);
        
        if (emailResult.success) {
            res.json({
                success: true,
                message: 'OTP sent successfully',
                email: email,
                // For development/testing only
                otp: process.env.NODE_ENV === 'development' ? otp : undefined
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to send OTP email',
                error: emailResult.error
            });
        }

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP endpoint
router.post('/verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        // Verify OTP
        const result = otpController.verifyOTP(email, otp);
        
        if (result.valid) {
            res.json({
                success: true,
                message: result.message,
                email: email
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message,
                attempts: result.attempts
            });
        }

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Test email configuration endpoint
router.get('/test-email', async (req, res) => {
    try {
        const result = await otpController.emailService.testEmailConfiguration();
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Email configuration test successful',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Email configuration test failed',
                error: result.error
            });
        }

    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Clean expired OTPs periodically (every 5 minutes)
setInterval(() => {
    otpController.cleanExpiredOTPs();
}, 5 * 60 * 1000);

module.exports = router;
