import { Skill } from '../../src/domain/shared/Skill.js';
import { Specialty } from '../../src/domain/identity/Specialty.js';
import { WorkingStyle } from '../../src/domain/identity/WorkingStyle.js';
import { Profile } from '../../src/domain/identity/Profile.js';
import { Account } from '../../src/domain/identity/Account.js';
import { Student } from '../../src/domain/identity/Student.js';
import {
  InvalidProfileDataError,
  InvalidTokenError,
  TokenExpiredError,
  UnauthorizedProfileEditError,
  EmailNotVerifiedError,
  AccountDeactivatedError,
} from '../../src/domain/identity/errors.js';

describe('Domain: Skill', () => {
  it('normalizes skill casing and trims whitespace', () => {
    expect(Skill.normalize('  React.js  ')).toBe('react.js');
    expect(Skill.normalize('Docker')).toBe('docker');
  });

  it('normalizes a list of skills and deduplicates case-insensitively', () => {
    const raw = ['React', 'react', ' REACT ', 'Node.JS', 'node.js', ''];
    const result = Skill.normalizeList(raw);
    expect(result).toEqual(['react', 'node.js']);
  });
});

describe('Domain: Profile', () => {
  it('creates a profile with valid default and custom attributes', () => {
    const profile = new Profile({
      skills: ['React', 'Node'],
      specialty: Specialty.BACKEND,
      weeklyAvailability: 15,
      timezone: 'America/New_York',
      workingStyle: WorkingStyle.FAST_PACED,
      experienceLevel: 'advanced',
      bio: 'Enthusiastic full-stack engineer.',
    });

    expect(profile.skills).toEqual(['react', 'node']);
    expect(profile.specialty).toBe('Backend');
    expect(profile.weeklyAvailability).toBe(15);
    expect(profile.timezone).toBe('America/New_York');
    expect(profile.workingStyle).toBe('fast-paced');
    expect(profile.experienceLevel).toBe('advanced');
    expect(profile.bio).toBe('Enthusiastic full-stack engineer.');
  });

  it('rejects bio exceeding 500 characters', () => {
    const longBio = 'a'.repeat(501);
    expect(() => new Profile({ bio: longBio })).toThrow(InvalidProfileDataError);
  });

  it('rejects negative weekly availability', () => {
    expect(() => new Profile({ weeklyAvailability: -5 })).toThrow(InvalidProfileDataError);
  });

  it('rejects invalid IANA timezone', () => {
    expect(() => new Profile({ timezone: 'Invalid/City' })).toThrow(InvalidProfileDataError);
  });

  it('rejects invalid Specialty', () => {
    expect(() => new Profile({ specialty: 'InvalidSpecialty' })).toThrow(InvalidProfileDataError);
  });

  it('rejects invalid WorkingStyle', () => {
    expect(() => new Profile({ workingStyle: 'lazy' })).toThrow(InvalidProfileDataError);
  });
});

describe('Domain: Account', () => {
  it('verifies email with valid token before expiration and prevents reuse', () => {
    const now = new Date('2026-10-17T12:00:00Z');
    const expiresAt = new Date('2026-10-17T13:00:00Z');

    const account = new Account({
      email: 'student@campus.edu',
      passwordHash: 'hash123',
    });
    account.setVerificationToken('valid-token', expiresAt);

    // Verify successfully
    account.verifyEmail('valid-token', new Date('2026-10-17T12:30:00Z'));
    expect(account.isEmailVerified).toBe(true);
    expect(account.verificationToken).toBeNull();

    // Second use must fail
    expect(() => account.verifyEmail('valid-token', now)).toThrow(InvalidTokenError);
  });

  it('rejects expired verification token', () => {
    const expiresAt = new Date('2026-10-17T13:00:00Z');
    const account = new Account({
      email: 'student@campus.edu',
      passwordHash: 'hash123',
    });
    account.setVerificationToken('token-123', expiresAt);

    const pastExpiry = new Date('2026-10-17T13:01:00Z');
    expect(() => account.verifyEmail('token-123', pastExpiry)).toThrow(TokenExpiredError);
  });

  it('resets password with single-use valid token', () => {
    const account = new Account({
      email: 'student@campus.edu',
      passwordHash: 'old-hash',
    });
    account.setResetPasswordToken('reset-token', new Date('2026-10-17T14:00:00Z'));

    account.resetPassword('reset-token', 'new-hash', new Date('2026-10-17T13:30:00Z'));
    expect(account.passwordHash).toBe('new-hash');
    expect(account.resetPasswordToken).toBeNull();

    // Re-use throws
    expect(() => account.resetPassword('reset-token', 'another-hash')).toThrow(InvalidTokenError);
  });

  it('deactivates account and prevents login', () => {
    const account = new Account({
      email: 'student@campus.edu',
      passwordHash: 'hash123',
    });
    account.deactivate();

    expect(() => account.assertCanLogin()).toThrow(AccountDeactivatedError);
  });
});

describe('Domain: Student & Rules (R2, R5)', () => {
  function createStudent(id = 'student-1', isEmailVerified = false) {
    const account = new Account({
      email: 'student@campus.edu',
      passwordHash: 'secret-hash',
      isEmailVerified,
    });
    return new Student({
      id,
      name: 'Alice Developer',
      account,
      profile: new Profile({ specialty: Specialty.FRONTEND }),
    });
  }

  it('R2: a Student can update their own Profile', () => {
    const student = createStudent('student-1');
    student.updateProfile({ specialty: Specialty.BACKEND }, 'student-1');
    expect(student.profile.specialty).toBe(Specialty.BACKEND);
  });

  it('R2: rejects profile update if requester is not the Student', () => {
    const student = createStudent('student-1');
    expect(() => {
      student.updateProfile({ specialty: Specialty.BACKEND }, 'student-impostor');
    }).toThrow(UnauthorizedProfileEditError);
  });

  it('R5: throws EmailNotVerifiedError when unverified student asserts verification', () => {
    const unverifiedStudent = createStudent('student-1', false);
    expect(() => unverifiedStudent.assertEmailVerified()).toThrow(EmailNotVerifiedError);

    const verifiedStudent = createStudent('student-2', true);
    expect(() => verifiedStudent.assertEmailVerified()).not.toThrow();
  });

  it('Privacy: public and private DTOs never expose passwordHash', () => {
    const student = createStudent('student-1', true);
    const pub = student.toPublicView();
    const priv = student.toPrivateView();

    expect(pub).not.toHaveProperty('passwordHash');
    expect(pub).not.toHaveProperty('email');

    expect(priv).not.toHaveProperty('passwordHash');
    expect(priv.email).toBe('student@campus.edu');
  });
});
