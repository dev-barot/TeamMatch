import crypto from 'node:crypto';
import { Student } from '../../domain/identity/Student.js';
import { Account, ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import { Profile } from '../../domain/identity/Profile.js';
import { AccountAlreadyExistsError } from '../../domain/identity/errors.js';

export class SignUp {
  constructor({ studentRepository, passwordHasher, mailer, clock }) {
    this.studentRepo = studentRepository;
    this.hasher = passwordHasher;
    this.mailer = mailer;
    this.clock = clock;
  }

  async execute({ name, email, password, specialty, skills, accountType = ACCOUNT_TYPES.STUDENT }) {
    const existing = await this.studentRepo.findByEmail(email);
    if (existing) {
      throw new AccountAlreadyExistsError(email);
    }

    const passwordHash = await this.hasher.hash(password);
    const verificationToken = crypto.randomUUID();
    const now = this.clock ? this.clock.now() : new Date();
    const tokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const account = new Account({
      email,
      passwordHash,
      accountType,
      isEmailVerified: false,
      verificationToken,
      verificationTokenExpiresAt: tokenExpiresAt,
      createdAt: now,
      updatedAt: now,
    });

    const profile = new Profile({
      specialty,
      skills,
    });

    const studentId = crypto.randomUUID();
    const student = new Student({
      id: studentId,
      name,
      account,
      profile,
    });

    await this.studentRepo.save(student);

    if (this.mailer) {
      await this.mailer.sendVerificationEmail(account.email, verificationToken);
    }

    return student.toPrivateView();
  }
}
