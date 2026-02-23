const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

/**
 * Send email utility using SendGrid API
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
    // Check if we have the necessary credentials
    const hasValidApiKey =
        process.env.SENDGRID_API_KEY &&
        process.env.SENDGRID_API_KEY !== 'your_sendgrid_api_key' &&
        process.env.SENDGRID_API_KEY !== '';

    // Development Fallback: If no API key, log to console
    if (!hasValidApiKey || process.env.NODE_ENV === 'development') {
        if (!hasValidApiKey) {
            console.log('\n--- DEVELOPMENT EMAIL FALLBACK (No API Key) ---');
        } else {
            console.log('\n--- DEVELOPMENT EMAIL LOG ---');
        }
        console.log(`TO:      ${options.email}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`BODY:    ${options.message || 'HTML Content'}`);
        console.log('------------------------------------------\n');

        // If we have an API key, we can still try to send it even in development 
        // if you want, but usually console logging is safer for dev.
        if (!hasValidApiKey) return { messageId: 'dev-fallback-' + Date.now() };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
        to: options.email,
        from: {
            email: process.env.EMAIL_FROM,
            name: 'Learnix Support'
        },
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const response = await sgMail.send(msg);
        console.log(`Email sent successfully via SendGrid: ${response[0].statusCode}`);
        return response;
    } catch (error) {
        console.error('SendGrid Error:', error.message);

        if (error.response) {
            console.error('SendGrid Error Details:', error.response.body);
        }

        // Catch common SendGrid errors
        if (error.code === 401) {
            console.error('CRITICAL: SendGrid Authentication failed. Check your SENDGRID_API_KEY in .env');
        } else if (error.code === 403) {
            console.error('CRITICAL: SendGrid Forbidden. Check if your sender (EMAIL_FROM) is verified.');
        }

        throw error;
    }
};

module.exports = sendEmail;
