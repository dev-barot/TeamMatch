/**
 * Port: Mailer
 * Decouples use cases from email delivery services (Resend, SendGrid, SMTP).
 */
export class Mailer {
  /**
   * @param {string} to
   * @param {string} token
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(_to, _token) {
    throw new Error('Not implemented: Mailer.sendVerificationEmail');
  }

  /**
   * @param {string} to
   * @param {string} token
   * @returns {Promise<void>}
   */
  async sendPasswordResetEmail(_to, _token) {
    throw new Error('Not implemented: Mailer.sendPasswordResetEmail');
  }
}
