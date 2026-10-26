import {
  AccountDeactivatedError,
  EmailNotVerifiedError,
  InvalidTokenError,
  TokenExpiredError,
} from './errors.js';

export const ACCOUNT_TYPES = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin',
});

export class Account {
  constructor({
    email,
    passwordHash,
    accountType = ACCOUNT_TYPES.STUDENT,
    isEmailVerified = false,
    isActive = true,
    isSeed = false,
    verificationToken = null,
    verificationTokenExpiresAt = null,
    resetPasswordToken = null,
    resetPasswordTokenExpiresAt = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!email || typeof email !== 'string') {
      throw new Error('Account email is required.');
    }
    if (!passwordHash || typeof passwordHash !== 'string') {
      throw new Error('Account passwordHash is required.');
    }

    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.accountType = accountType;
    this.isEmailVerified = Boolean(isEmailVerified);
    this.isActive = Boolean(isActive);
    this.isSeed = Boolean(isSeed);
    this.verificationToken = verificationToken;
    this.verificationTokenExpiresAt = verificationTokenExpiresAt ? new Date(verificationTokenExpiresAt) : null;
    this.resetPasswordToken = resetPasswordToken;
    this.resetPasswordTokenExpiresAt = resetPasswordTokenExpiresAt ? new Date(resetPasswordTokenExpiresAt) : null;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  assertCanLogin() {
    if (!this.isActive) {
      throw new AccountDeactivatedError();
    }
  }

  assertEmailVerified() {
    if (!this.isEmailVerified) {
      throw new EmailNotVerifiedError();
    }
  }

  setVerificationToken(token, expiresAt) {
    this.verificationToken = token;
    this.verificationTokenExpiresAt = new Date(expiresAt);
    this.updatedAt = new Date();
  }

  verifyEmail(token, now = new Date()) {
    if (!this.verificationToken || this.verificationToken !== token) {
      throw new InvalidTokenError('Invalid email verification token.');
    }
    if (this.verificationTokenExpiresAt && now > this.verificationTokenExpiresAt) {
      throw new TokenExpiredError();
    }

    this.isEmailVerified = true;
    this.verificationToken = null;
    this.verificationTokenExpiresAt = null;
    this.updatedAt = new Date();
  }

  setResetPasswordToken(token, expiresAt) {
    this.resetPasswordToken = token;
    this.resetPasswordTokenExpiresAt = new Date(expiresAt);
    this.updatedAt = new Date();
  }

  resetPassword(token, newPasswordHash, now = new Date()) {
    if (!this.resetPasswordToken || this.resetPasswordToken !== token) {
      throw new InvalidTokenError('Invalid password reset token.');
    }
    if (this.resetPasswordTokenExpiresAt && now > this.resetPasswordTokenExpiresAt) {
      throw new TokenExpiredError();
    }

    this.passwordHash = newPasswordHash;
    this.resetPasswordToken = null;
    this.resetPasswordTokenExpiresAt = null;
    this.updatedAt = new Date();
  }

  deactivate() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate() {
    this.isActive = true;
    this.updatedAt = new Date();
  }
}
