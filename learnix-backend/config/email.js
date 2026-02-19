const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE, // e.g., 'SendGrid'
        auth: {
            user: 'apikey', // specific to SendGrid when using nodemailer with service
            pass: process.env.SENDGRID_API_KEY,
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
