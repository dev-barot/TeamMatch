import { Mailer } from '../../ports/Mailer.js';

export class ConsoleMailer extends Mailer {
  constructor() {
    super();
    this.sentEmails = [];
  }

  async sendVerificationEmail(to, token) {
    const entry = { type: 'verification', to, token, sentAt: new Date() };
    this.sentEmails.push(entry);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[ConsoleMailer] Email Verification to ${to}: Token=${token}`);
    }
  }

  async sendPasswordResetEmail(to, token) {
    const entry = { type: 'reset', to, token, sentAt: new Date() };
    this.sentEmails.push(entry);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[ConsoleMailer] Password Reset to ${to}: Token=${token}`);
    }
  }
}
