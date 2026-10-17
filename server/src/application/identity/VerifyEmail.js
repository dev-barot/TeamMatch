import { InvalidTokenError } from '../../domain/identity/errors.js';

export class VerifyEmail {
  constructor({ studentRepository, clock }) {
    this.studentRepo = studentRepository;
    this.clock = clock;
  }

  async execute({ token }) {
    if (!token) {
      throw new InvalidTokenError('Verification token is required.');
    }

    const student = await this.studentRepo.findByVerificationToken(token);
    if (!student) {
      throw new InvalidTokenError('Invalid or expired verification token.');
    }

    const now = this.clock ? this.clock.now() : new Date();
    student.account.verifyEmail(token, now);
    await this.studentRepo.save(student);

    return {
      message: 'Email successfully verified.',
      student: student.toPrivateView(),
    };
  }
}
