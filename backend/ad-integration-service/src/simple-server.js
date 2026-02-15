const express = require('express');
const cors = require('cors');

// Simple OTP service without email sending for demo
class SimpleOTPService {
    constructor() {
        this.otpStore = new Map();
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    storeOTP(email, otp) {
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        this.otpStore.set(email, {
            otp: otp,
            expiry: expiry,
            attempts: 0
        });
        
        console.log(`OTP generated for ${email}: ${otp}, expires at: ${expiry}`);
        return otp;
    }

    verifyOTP(email, providedOTP) {
        const storedData = this.otpStore.get(email);
        
        if (!storedData) {
            return { valid: false, message: 'No OTP found for this email' };
        }

        // Check expiry
        if (new Date() > storedData.expiry) {
            this.otpStore.delete(email);
            return { valid: false, message: 'OTP has expired' };
        }

        // Check attempts (max 3 attempts)
        if (storedData.attempts >= 3) {
            this.otpStore.delete(email);
            return { valid: false, message: 'Too many failed attempts. Please request new OTP' };
        }

        // Verify OTP
        if (storedData.otp !== providedOTP) {
            storedData.attempts++;
            return { valid: false, message: 'Invalid OTP', attempts: 3 - storedData.attempts };
        }

        // OTP is valid - remove it
        this.otpStore.delete(email);
        return { valid: true, message: 'OTP verified successfully' };
    }
}

const otpService = new SimpleOTPService();

const app = express();
const PORT = process.env.AD_INTEGRATION_SERVICE_PORT || 8003;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ad-integration-service',
        version: '1.0.0',
        mode: 'otp-service'
    });
});

// Send OTP endpoint
app.post('/api/otp/send', (req, res) => {
    try {
        const { email, userName, predefinedOTP } = req.body;

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

        // Use predefined OTP if provided, otherwise generate new one
        let otp;
        if (predefinedOTP) {
            otp = predefinedOTP;
            console.log(`Using predefined OTP for ${email}: ${otp}`);
        } else {
            otp = otpService.generateOTP();
            console.log(`Generated new OTP for ${email}: ${otp}`);
        }
        
        // Store the OTP
        otpService.storeOTP(email, otp);
        
        console.log(`OTP for ${email}: ${otp}, expires at: ${otpService.otpStore.get(email).expiry}`);
        
        res.json({
            success: true,
            message: 'OTP sent successfully',
            email: email,
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify OTP endpoint
app.post('/api/otp/verify', (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const result = otpService.verifyOTP(email, otp);
        
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

// Test endpoint
app.get('/api/otp/test', (req, res) => {
    res.json({
        success: true,
        message: 'OTP service is working',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AdSphere OTP Service running on port ${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔗 OTP Endpoints: http://localhost:${PORT}/api/otp/*`);
    console.log(`📧 Note: Email sending disabled - OTP shown in console`);
});

module.exports = app;
