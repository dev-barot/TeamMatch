import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import { UnauthorizedAdminActionError } from '../../domain/moderation/errors.js';

/**
 * Use Case: ListAccounts
 * Admin views all Accounts (active, deactivated, verified, unverified) with pagination.
 *
 * Rule R2: Only Admin may call this use case.
 * Returns a privacy-safe DTO — never returns passwordHash.
 */
export class ListAccounts {
  constructor({ studentRepository }) {
    this.studentRepo = studentRepository;
  }

  async execute({ requesterId, requesterAccountType, filters = {} }) {
    // Domain-level R2 check (not trusting middleware alone)
    if (requesterAccountType !== ACCOUNT_TYPES.ADMIN) {
      throw new UnauthorizedAdminActionError('Only an Admin can list all Accounts (R2).');
    }

    const limit = Math.min(Number(filters.limit) || 50, 100);
    const offset = Number(filters.offset) || 0;

    const students = await this.studentRepo.findAll({ limit, offset });

    return students.map((student) => toAccountDto(student));
  }
}

/**
 * Privacy-safe DTO for Admin account listing.
 * Never exposes passwordHash, tokens, or reset tokens.
 */
function toAccountDto(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.account.email,
    accountType: student.account.accountType,
    isEmailVerified: student.account.isEmailVerified,
    isActive: student.account.isActive,
    specialty: student.profile?.specialty || null,
    createdAt: student.account.createdAt.toISOString(),
  };
}
