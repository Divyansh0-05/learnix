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
