import crypto from 'node:crypto';

export class RequestPasswordReset {
  constructor({ studentRepository, mailer, clock }) {
    this.studentRepo = studentRepository;
    this.mailer = mailer;
    this.clock = clock;
  }

  async execute({ email }) {
    if (!email) return { message: 'If the email exists, a reset link was sent.' };

    const student = await this.studentRepo.findByEmail(email);
    if (!student) {
      // Prevents email enumeration
      return { message: 'If the email exists, a reset link was sent.' };
    }

    const resetToken = crypto.randomUUID();
    const now = this.clock ? this.clock.now() : new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

    student.account.setResetPasswordToken(resetToken, expiresAt);
    await this.studentRepo.save(student);

    if (this.mailer) {
      await this.mailer.sendPasswordResetEmail(student.account.email, resetToken);
    }

    return { message: 'If the email exists, a reset link was sent.' };
  }
}
