import { InvalidCredentialsError } from '../../domain/identity/errors.js';

export class ResendVerificationCode {
  constructor({ studentRepository, mailer, clock }) {
    this.studentRepo = studentRepository;
    this.mailer = mailer;
    this.clock = clock;
  }

  async execute({ email }) {
    if (!email) {
      throw new InvalidCredentialsError();
    }

    const student = await this.studentRepo.findByEmail(email);
    if (!student) {
      // Return safe message
      return { message: 'If this email belongs to an account, a verification code has been dispatched.' };
    }

    if (student.account.isEmailVerified) {
      return { message: 'This account is already verified. You can log in directly.' };
    }

    const newPin = String(Math.floor(1000 + Math.random() * 9000));
    const now = this.clock ? this.clock.now() : new Date();
    const tokenExpiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 mins

    student.account.setVerificationToken(newPin, tokenExpiresAt);
    await this.studentRepo.save(student);

    if (this.mailer) {
      await this.mailer.sendVerificationEmail(student.account.email, newPin);
    }

    return { message: 'A new 4-digit verification code has been sent to your email.' };
  }
}

