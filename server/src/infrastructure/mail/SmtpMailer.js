import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Mailer } from '../../ports/Mailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env whether running from root, server, or subdirectories
const candidateEnvPaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
];
for (const p of candidateEnvPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}
dotenv.config();

export class SmtpMailer extends Mailer {
  constructor(options = {}) {
    super();
    this.host = options.host || process.env.SMTP_HOST;
    this.port = parseInt(options.port || process.env.SMTP_PORT || '587', 10);
    this.secure = options.secure ?? (process.env.SMTP_SECURE === 'true' || this.port === 465);
    this.user = options.user || process.env.SMTP_USER;
    this.pass = options.pass || process.env.SMTP_PASS;

    // For Gmail SMTP, the 'from' address must match the authenticated account
    const defaultFrom = this.user ? `"TeamMatch Platform" <${this.user}>` : '"TeamMatch Platform" <noreply@teammatch.edu>';
    this.from = options.from || process.env.SMTP_FROM || defaultFrom;
    if (this.user && this.user.endsWith('@gmail.com') && this.from.includes('@teammatch.edu')) {
      this.from = `"TeamMatch Platform" <${this.user}>`;
    }

    this.transporter = null;
    this.sentEmails = [];

    if (this.host && this.user && this.pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host: this.host,
          port: this.port,
          secure: this.secure,
          auth: {
            user: this.user,
            pass: this.pass,
          },
        });
        console.log(`[SMTP Mailer] 🚀 Initialized SMTP transporter (${this.host}:${this.port}) for ${this.user}`);
      } catch (err) {
        console.warn('[SMTP Mailer] ⚠️ Transporter init error:', err.message);
      }
    } else {
      console.log(`[SMTP Mailer] ℹ️ Host/User/Pass not fully configured. Will log PINs to console.`);
    }
  }

  async sendVerificationEmail(to, token) {
    const entry = { type: 'verification', to, token, sentAt: new Date() };
    this.sentEmails.push(entry);

    console.log(`\n======================================================`);
    console.log(`[SMTP Mailer] 📧 Email Verification Code for: ${to}`);
    console.log(`[SMTP Mailer] 🔑 4-Digit Verification PIN: [ ${token} ]`);
    console.log(`[SMTP Mailer] ⏳ Expires in: 15 minutes`);
    console.log(`======================================================\n`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject: `${token} is your TeamMatch verification code`,
          text: `Welcome to TeamMatch!\n\nYour 4-digit verification PIN is: ${token}\n\nThis PIN will expire in 15 minutes. Enter this code on the platform to auto-verify your account and activate full access.\n\nIf you did not request this, please ignore this email.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; color: #0f172a;">
              <div style="margin-bottom: 24px;">
                <span style="font-size: 22px; font-weight: 800; color: #0f172a;">Team<span style="color: #2563eb;">Match</span></span>
              </div>
              <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Verify Your Email Address</h2>
              <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                Thank you for joining TeamMatch! Please use the 4-digit verification code below to activate your university student account:
              </p>
              <div style="background: #f8fafc; border: 2px dashed #93c5fd; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                <div style="font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #1d4ed8; font-family: monospace;">
                  ${token}
                </div>
                <div style="font-size: 13px; color: #64748b; margin-top: 10px; font-weight: 600;">
                  Expires in 15 minutes • Auto-approval on entry
                </div>
              </div>
              <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0 0 16px 0;">
                Once this PIN is submitted, your account is immediately verified and ready to browse, post projects, and form teams with zero admin wait time.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                If you did not sign up for TeamMatch, you can safely ignore this email.
              </p>
            </div>
          `,
        });
        console.log(`[SMTP Mailer] ✅ Email successfully delivered to ${to} via SMTP!`);
      } catch (err) {
        console.warn(`[SMTP Mailer] ⚠️ SMTP delivery failed (${err.message}). Fallback to console PIN above.`);
      }
    } else {
      console.log(`[SMTP Mailer] ℹ️ SMTP credentials not configured in .env. Use console PIN above for dev verification.`);
    }
  }

  async sendPasswordResetEmail(to, token) {
    const entry = { type: 'reset', to, token, sentAt: new Date() };
    this.sentEmails.push(entry);

    console.log(`[SMTP Mailer] 🔑 Password Reset Code to ${to}: ${token}`);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.from,
          to,
          subject: `${token} is your TeamMatch password reset code`,
          text: `You requested a password reset. Your reset code is: ${token}\n\nIf you did not request this, please ignore this email.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">Password Reset</h2>
              <p style="font-size: 15px; color: #475569; margin: 0 0 20px 0;">Use the code below to reset your password:</p>
              <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; font-family: monospace; color: #1e293b;">
                ${token}
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.warn(`[SMTP Mailer] ⚠️ SMTP reset delivery failed (${err.message}).`);
      }
    }
  }
}
