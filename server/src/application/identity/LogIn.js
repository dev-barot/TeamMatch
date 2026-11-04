import { InvalidCredentialsError } from '../../domain/identity/errors.js';

export class LogIn {
  constructor({ studentRepository, passwordHasher, tokenSigner }) {
    this.studentRepo = studentRepository;
    this.hasher = passwordHasher;
    this.tokenSigner = tokenSigner;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new InvalidCredentialsError();
    }

    const student = await this.studentRepo.findByEmail(email);
    if (!student) {
      throw new InvalidCredentialsError();
    }

    const isMatch = await this.hasher.compare(password, student.account.passwordHash);
    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    // Ensures deactivated account cannot log in
    student.account.assertCanLogin();

    // Auto-promote seeded admin emails to full admin access
    const isDedicatedAdmin = student.account.email.trim().toLowerCase() === 'admin@teammatch.edu' || student.account.email.trim().toLowerCase() === 'admin@teammatch.app';
    if (isDedicatedAdmin) {
      student.account.accountType = 'admin';
      student.account.isEmailVerified = true;
    }

    const payload = {
      sub: student.id,
      email: student.account.email,
      accountType: isDedicatedAdmin ? 'admin' : student.account.accountType,
      isEmailVerified: isDedicatedAdmin ? true : student.account.isEmailVerified,
    };

    const accessToken = this.tokenSigner.signAccessToken(payload);
    const refreshToken = this.tokenSigner.signRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      student: student.toPrivateView(),
    };
  }
}
