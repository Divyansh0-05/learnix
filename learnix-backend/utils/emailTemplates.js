exports.getPasswordResetTemplate = (resetUrl, userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Learnix Password Reset</title>
        <style>
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #000000;
                color: #ffffff;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #111111;
                border: 1px solid #222222;
                border-radius: 12px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
            }
            .logo {
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.5px;
                margin-bottom: 30px;
                color: #ffffff;
                text-decoration: none;
            }
            .title {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #ffffff;
            }
            .text {
                font-size: 16px;
                line-height: 1.5;
                color: #A1A1AA;
                margin-bottom: 30px;
            }
            .btn-container {
                margin: 30px 0;
            }
            .btn {
                background-color: #ffffff;
                color: #000000;
                padding: 14px 32px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                text-decoration: none;
                display: inline-block;
            }
            .divider {
                height: 1px;
                background-color: rgba(255, 255, 255, 0.1);
                margin: 30px 0;
            }
            .footer {
                font-size: 14px;
                color: #71717A;
            }
            .link-text {
                background-color: #000000;
                padding: 12px;
                border-radius: 6px;
                word-break: break-all;
                font-size: 14px;
                margin-top: 10px;
            }
        </style>
    </head>
    <body style="background-color: #000000; margin: 0; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center">
                    <div class="container">
                        <div class="logo">Learnix</div>
                        <h2 class="title">Password Reset Request</h2>
                        <p class="text">Hi ${userName},</p>
                        <p class="text">We received a request to reset your password for your Learnix account. If you didn't make this request, you can safely ignore this email.</p>
                        
                        <div class="btn-container">
                            <a href="${resetUrl}" class="btn" style="color: #000000; text-decoration: none;">Reset Password</a>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p class="footer">If the button doesn't work, click or copy this link into your browser:</p>
                        <div class="link-text">
                            <a href="${resetUrl}" style="color: #ffffff; text-decoration: underline;">${resetUrl}</a>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

exports.getConnectionRequestTemplate = (dashboardUrl, senderName, message) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connection Request - Learnix</title>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; margin-bottom: 30px; display: block; }
            .title { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.02em; }
            .text { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 24px; }
            .message-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; text-align: left; margin: 24px 0; color: rgba(255,255,255,0.8); font-style: italic; }
            .btn { background-color: #ffffff; color: #000000; padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; transition: all 0.2s; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: rgba(255,255,255,0.4); }
        </style>
    </head>
    <body style="background-color: #000000; padding: 20px;">
        <div class="container">
            <div class="logo">Learnix</div>
            <h1 class="title">New Connection Request!</h1>
            <p class="text"><strong>${senderName}</strong> wants to connect with you on Learnix to swap skills.</p>
            
            ${message ? `
            <div class="message-box">
                "${message}"
            </div>
            ` : ''}
            
            <p class="text" style="font-size: 14px;">Log in to your dashboard to review and respond to this request.</p>
            
            <a href="${dashboardUrl}" class="btn">View Request</a>
            
            <div class="footer">
                You received this because someone on Learnix requested to connect with you.<br>
                &copy; 2026 Learnix. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

exports.getRequestAcceptedTemplate = (chatUrl, responderName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Accepted - Learnix</title>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; margin-bottom: 30px; display: block; }
            .badge { background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; display: inline-block; }
            .title { font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 16px; letter-spacing: -0.03em; }
            .text { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 30px; }
            .btn { background-color: #ffffff; color: #000000; padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: rgba(255,255,255,0.4); }
        </style>
    </head>
    <body style="background-color: #000000; padding: 20px;">
        <div class="container">
            <div class="logo">Learnix</div>
            <div class="badge">Connection Successful</div>
            <h1 class="title">It's a Match!</h1>
            <p class="text">Great news! <strong>${responderName}</strong> accepted your connection request. You can now start collaborating and trading skills.</p>
            
            <a href="${chatUrl}" class="btn">Start Chatting</a>
            
            <div class="footer">
                You're now connected with ${responderName} on Learnix.<br>
                &copy; 2026 Learnix. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

exports.getEmailVerificationTemplate = (verificationUrl, userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Learnix</title>
        <style>
            body { font-family: 'Inter', sans-serif; background-color: #000000; color: #ffffff; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #0a0a0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; text-align: center; }
            .logo { font-size: 24px; font-weight: 800; color: #ffffff; text-decoration: none; margin-bottom: 30px; display: block; }
            .title { font-size: 24px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
            .text { font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.6); margin-bottom: 30px; }
            .btn { background-color: #ffffff; color: #000000; padding: 14px 32px; border-radius: 30px; font-size: 15px; font-weight: 700; text-decoration: none; display: inline-block; }
            .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: rgba(255,255,255,0.4); }
        </style>
    </head>
    <body style="background-color: #000000; padding: 20px;">
        <div class="container">
            <div class="logo">Learnix</div>
            <h1 class="title">Welcome to Learnix!</h1>
            <p class="text">Hi ${userName}, we're excited to have you join our skill-trading community. Please verify your email address to get started.</p>
            
            <a href="${verificationUrl}" class="btn">Verify Email</a>
            
            <p class="text" style="font-size: 13px; margin-top: 30px;">
                Alternatively, copy and paste this link in your browser:<br>
                <span style="color: #ffffff; text-decoration: underline;">${verificationUrl}</span>
            </p>
            
            <div class="footer">
                If you didn't create an account, you can safely ignore this email.<br>
                &copy; 2026 Learnix. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};
