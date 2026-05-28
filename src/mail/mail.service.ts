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
        template: 'welcome',
        context: {
          name: user.name,
          email: user.email,
        },
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
        template: 'reset-password',
        context: {
          otp: otp,
          email: email,
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error.stack);
      throw error;
    }
  }
} 