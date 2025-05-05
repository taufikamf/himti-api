import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendWelcomeEmail(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: {
          name: 'HIMTI UIN Jakarta',
          address: process.env.MAIL_FROM,
        },
        subject: 'Welcome to HIMTI Website!',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #2563eb;
                  color: white;
                  text-align: center;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background-color: #f8fafc;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                  border: 1px solid #e2e8f0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #64748b;
                  font-size: 14px;
                }
                .highlight {
                  color: #2563eb;
                  font-weight: bold;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #2563eb;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to HIMTI! 🎉</h1>
                </div>
                <div class="content">
                  <h2>Dear ${user.name},</h2>
                  <p>Welcome to the <span class="highlight">HIMTI (Himpunan Mahasiswa Teknik Informatika)</span> community! We're thrilled to have you join us.</p>
                  <p>You can now access all features of our website using your registered email: <span class="highlight">${user.email}</span></p>
                  <p>As a member, you'll get access to:</p>
                  <ul>
                    <li>Exclusive HIMTI events and activities</li>
                    <li>Educational resources and materials</li>
                    <li>Community forums and discussions</li>
                    <li>Latest news and updates</li>
                  </ul>
                  <a href="https://himti-web.vercel.app" class="button">Visit Our Website</a>
                  <p>If you have any questions or need assistance, our support team is always here to help!</p>
                  <br>
                  <p>Best regards,</p>
                  <p><strong>HIMTI Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 HIMTI UIN Jakarta. All rights reserved.</p>
                  <p>This email was sent to ${user.email}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      this.logger.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, otp: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: {
          name: 'HIMTI UIN Jakarta',
          address: process.env.MAIL_FROM,
        },
        subject: 'Password Reset Request - HIMTI Website',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background-color: #dc2626;
                  color: white;
                  text-align: center;
                  padding: 20px;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  background-color: #f8fafc;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                  border: 1px solid #e2e8f0;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #64748b;
                  font-size: 14px;
                }
                .otp-box {
                  background-color: #f1f5f9;
                  border: 2px dashed #dc2626;
                  padding: 15px;
                  text-align: center;
                  font-size: 24px;
                  font-weight: bold;
                  color: #dc2626;
                  margin: 20px 0;
                  border-radius: 6px;
                }
                .warning {
                  color: #dc2626;
                  font-weight: bold;
                }
                .timer {
                  color: #64748b;
                  font-style: italic;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Password Reset Request 🔐</h1>
                </div>
                <div class="content">
                  <h2>Hello!</h2>
                  <p>We received a request to reset your password for your HIMTI account.</p>
                  <p>Your OTP code is:</p>
                  <div class="otp-box">
                    ${otp}
                  </div>
                  <p class="timer">This code will expire in 15 minutes.</p>
                  <p class="warning">If you didn't request this password reset, please ignore this email or contact us if you have concerns.</p>
                  <br>
                  <p>Best regards,</p>
                  <p><strong>HIMTI Team</strong></p>
                </div>
                <div class="footer">
                  <p>© 2024 HIMTI UIN Jakarta. All rights reserved.</p>
                  <p>This email was sent to ${email}</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error.stack);
      throw error;
    }
  }
} 