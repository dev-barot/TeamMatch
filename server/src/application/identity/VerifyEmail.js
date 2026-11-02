import { InvalidTokenError } from '../../domain/identity/errors.js';

export class VerifyEmail {
  constructor({ studentRepository, clock }) {
    this.studentRepo = studentRepository;
    this.clock = clock;
  }

  async execute({ token, email }) {
    if (!token) {
      throw new InvalidTokenError('Verification code is required.');
    }

    let student = null;
    if (email) {
      student = await this.studentRepo.findByEmail(email);
    }
    if (!student) {
      student = await this.studentRepo.findByVerificationToken(token);
    }

    if (!student) {
      throw new InvalidTokenError('Invalid or expired verification PIN.');
    }

    const now = this.clock ? this.clock.now() : new Date();
    student.account.verifyEmail(token, now);
    await this.studentRepo.save(student);

    return {
      message: 'Email successfully verified. Your account has been activated!',
      student: student.toPrivateView(),
    };
  }
}
