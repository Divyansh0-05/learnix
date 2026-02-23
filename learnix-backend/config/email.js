const nodemailer = require('nodemailer');

/**
 * Send email utility
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Check if we have the necessary credentials
    const hasValidCredentials =
        process.env.EMAIL_PASSWORD &&
        process.env.EMAIL_PASSWORD !== 'your_16_character_app_password' &&
        process.env.EMAIL_PASSWORD !== '';

    // Development Fallback: If no credentials, log to console
    if (!hasValidCredentials) {
        console.log('\n--- DEVELOPMENT EMAIL FALLBACK ---');
        console.log(`TO:      ${options.email}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`BODY:    ${options.message || 'HTML Content (check below)'}`);
        if (options.data && options.data.resetUrl) {
            console.log(`LINK:    ${options.data.resetUrl}`);
        }
        console.log('----------------------------------\n');

        return { messageId: 'dev-fallback-' + Date.now() };
    }

    // Create transporter with explicit settings (often more reliable on Render)
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD,
        },
        // Add a timeout to avoid long waits
        connectionTimeout: 10000, // 10 seconds
    });

    const mailOptions = {
        from: `"Learnix Support" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('Nodemailer Error:', error.message);
        // Log more details if it's an auth error
        if (error.code === 'EAUTH') {
            console.error('CRITICAL: Email authentication failed. Check your App Password in .env');
        }
        throw error;
    }
};

module.exports = sendEmail;
