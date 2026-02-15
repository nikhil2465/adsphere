const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'your-email@gmail.com',
                pass: process.env.SMTP_PASS || 'your-app-password'
            }
        });
    }

    // Email templates
    getOTPTemplate(otp, userName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AdSphere - OTP Verification</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 10px;
                }
                .title {
                    color: #1a1a2e;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                }
                .otp-container {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 15px;
                    padding: 30px;
                    text-align: center;
                    margin: 30px 0;
                    border: 2px solid #e2e8f0;
                }
                .otp-label {
                    color: #64748b;
                    font-size: 14px;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
                .otp-code {
                    font-size: 36px;
                    font-weight: 700;
                    color: #1a1a2e;
                    letter-spacing: 8px;
                    background: white;
                    padding: 20px 30px;
                    border-radius: 10px;
                    border: 2px solid #e2e8f0;
                    display: inline-block;
                    min-width: 200px;
                }
                .info {
                    text-align: center;
                    color: #64748b;
                    font-size: 14px;
                    margin-top: 30px;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #9ca3af;
                    font-size: 12px;
                }
                .expiry {
                    color: #ef4444;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚀 AdSphere</div>
                    <h1 class="title">OTP Verification</h1>
                </div>
                
                <div class="otp-container">
                    <div class="otp-label">Your verification code is:</div>
                    <div class="otp-code">${otp}</div>
                </div>
                
                <div class="info">
                    <p>Hello <strong>${userName}</strong>,</p>
                    <p>Use the above 6-digit code to verify your AdSphere account.</p>
                    <p class="expiry">This code will expire in 10 minutes.</p>
                </div>
                
                <div class="footer">
                    <p>This is an automated message from AdSphere Campaign Management Platform.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getWelcomeTemplate(userName, email) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AdSphere - Welcome</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 20px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 32px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 10px;
                }
                .title {
                    color: #1a1a2e;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                }
                .welcome-info {
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 15px;
                    padding: 30px;
                    margin: 20px 0;
                    border: 2px solid #e2e8f0;
                }
                .user-details {
                    margin-bottom: 20px;
                }
                .user-details p {
                    color: #64748b;
                    font-size: 16px;
                    margin: 5px 0;
                }
                .user-details strong {
                    color: #1a1a2e;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                    color: #9ca3af;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚀 AdSphere</div>
                    <h1 class="title">Welcome to AdSphere!</h1>
                </div>
                
                <div class="welcome-info">
                    <div class="user-details">
                        <p><strong>Name:</strong> ${userName}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Your AdSphere account has been successfully created.</p>
                    <p>You can now log in and manage your advertising campaigns.</p>
                    <p>This is an automated message from AdSphere Campaign Management Platform.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendOTPEmail(email, otp, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'AdSphere <noreply@adsphere.com>',
                to: email,
                subject: 'AdSphere - Your OTP Verification Code',
                html: this.getOTPTemplate(otp, userName)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('OTP email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return { success: false, error: error.message };
        }
    }

    async sendWelcomeEmail(email, userName) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'AdSphere <noreply@adsphere.com>',
                to: email,
                subject: 'Welcome to AdSphere - Account Created Successfully',
                html: this.getWelcomeTemplate(userName, email)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Welcome email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    // Test email configuration
    async testEmailConfiguration() {
        try {
            const testEmail = process.env.TEST_EMAIL || 'test@example.com';
            const testOTP = '123456';
            const testUserName = 'Test User';
            
            const result = await this.sendOTPEmail(testEmail, testOTP, testUserName);
            return result;
        } catch (error) {
            console.error('Email configuration test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailService;
