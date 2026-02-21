const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasValidKey = process.env.EMAIL_PASSWORD &&
        process.env.EMAIL_PASSWORD !== 'your_gmail_app_password' &&
        process.env.EMAIL_PASSWORD !== '';

    if (!hasValidKey) {
        console.log('------------------------------------------------');
        console.log('DEVELOPMENT EMAIL FALLBACK (No API Key found)');
        console.log(`TO: ${options.email}`);
        console.log(`SUBJECT: ${options.subject}`);
        console.log(`MESSAGE: ${options.message || 'Check Reset Link below'}`);
        if (options.data && options.data.resetUrl) {
            console.log(`RESET URL: ${options.data.resetUrl}`);
        }
        console.log('------------------------------------------------');

        // Return a mock success response so the flow doesn't break
        return { messageId: 'dev-fallback-message-id' };
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_FROM,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const message = {
        from: `${process.env.EMAIL_FROM}`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
