import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import {
  UnauthorizedAdminActionError,
  AccountNotFoundError,
  AccountAlreadyDeactivatedError,
} from '../../domain/moderation/errors.js';

/**
 * Use Case: DeactivateAccount
 * Admin deactivates a Student Account.
 *
 * Rule R2: Only Admin may call this use case.
 * Invariant: DeactivateAccount touches Account.isActive only — never edits Profile.
 * Side-effect: deactivated Account is hidden from matching (Account.isActive = false).
 * Login is blocked by Account.assertCanLogin() in the LogIn use case.
 */
export class DeactivateAccount {
  constructor({ studentRepository }) {
    this.studentRepo = studentRepository;
  }

  async execute({ targetStudentId, adminId, requesterAccountType }) {
    // Domain-level R2 check
    if (requesterAccountType !== ACCOUNT_TYPES.ADMIN) {
      throw new UnauthorizedAdminActionError('Only an Admin can deactivate an Account (R2).');
    }

    const student = await this.studentRepo.findById(targetStudentId);
    if (!student) {
      throw new AccountNotFoundError(targetStudentId);
    }

    if (!student.account.isActive) {
      throw new AccountAlreadyDeactivatedError(targetStudentId);
    }

    // Domain method — Account.deactivate() exists from M1
    student.account.deactivate();
    await this.studentRepo.save(student);

    return {
      id: student.id,
      name: student.name,
      email: student.account.email,
      isActive: student.account.isActive,
      deactivatedByAdminId: String(adminId),
    };
  }
}
