import { InvalidTokenError } from '../../domain/identity/errors.js';

export class RefreshAccessToken {
  constructor({ studentRepository, tokenSigner }) {
    this.studentRepo = studentRepository;
    this.tokenSigner = tokenSigner;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) {
      throw new InvalidTokenError('Refresh token is required.');
    }

    let decoded;
    try {
      decoded = this.tokenSigner.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidTokenError('Invalid or expired refresh token.');
    }

    const student = await this.studentRepo.findById(decoded.sub);
    if (!student) {
      throw new InvalidTokenError('Student account not found.');
    }

    student.account.assertCanLogin();

    const payload = {
      sub: student.id,
      email: student.account.email,
      accountType: student.account.accountType,
      isEmailVerified: student.account.isEmailVerified,
    };

    const accessToken = this.tokenSigner.signAccessToken(payload);

    return {
      accessToken,
    };
  }
}
