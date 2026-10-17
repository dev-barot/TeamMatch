import { InvalidTokenError } from '../../domain/identity/errors.js';

export class ResetPassword {
  constructor({ studentRepository, passwordHasher, clock }) {
    this.studentRepo = studentRepository;
    this.hasher = passwordHasher;
    this.clock = clock;
  }

  async execute({ token, newPassword }) {
    if (!token || !newPassword) {
      throw new InvalidTokenError('Reset token and new password are required.');
    }

    const student = await this.studentRepo.findByResetToken(token);
    if (!student) {
      throw new InvalidTokenError('Invalid or expired password reset token.');
    }

    const now = this.clock ? this.clock.now() : new Date();
    const newHash = await this.hasher.hash(newPassword);

    student.account.resetPassword(token, newHash, now);
    await this.studentRepo.save(student);

    return {
      message: 'Password successfully reset.',
    };
  }
}
