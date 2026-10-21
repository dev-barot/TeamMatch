import { Origin } from './Origin.js';
import { ApplicationStatus } from './ApplicationStatus.js';
import {
  InvalidApplicationStatusTransitionError,
  UnauthorizedApplicationActionError,
} from './errors.js';

export class Application {
  constructor({
    id,
    projectId,
    studentId,
    specialty,
    origin = Origin.APPLIED,
    status = ApplicationStatus.PENDING,
    notes = '',
    rejectionReason = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!id) throw new Error('Application id is required.');
    if (!projectId) throw new Error('Application projectId is required.');
    if (!studentId) throw new Error('Application studentId is required.');
    if (!specialty) throw new Error('Application specialty is required.');
    if (!Origin.isValid(origin)) throw new Error(`Invalid Origin: "${origin}".`);
    if (!ApplicationStatus.isValid(status)) throw new Error(`Invalid ApplicationStatus: "${status}".`);

    this.id = String(id);
    this.projectId = String(projectId);
    this.studentId = String(studentId);
    this.specialty = specialty;
    this.origin = origin;
    this.status = status;
    this.notes = typeof notes === 'string' ? notes.trim() : '';
    this.rejectionReason = rejectionReason;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  isActive() {
    return ApplicationStatus.isActive(this.status);
  }

  isPending() {
    return this.status === ApplicationStatus.PENDING;
  }

  isAccepted() {
    return this.status === ApplicationStatus.ACCEPTED;
  }

  /**
   * Rule R2: For student-initiated applications, only the Project's Creator can decide.
   */
  assertCanDecide(requesterId, projectCreatorId) {
    if (this.origin === Origin.APPLIED && String(requesterId) !== String(projectCreatorId)) {
      throw new UnauthorizedApplicationActionError('Only the Project Creator can decide on Applications (R2).');
    }
  }

  /**
   * For invitations, only the invited Student can respond (accept or reject).
   */
  assertCanRespond(requesterId) {
    if (this.origin === Origin.INVITED && String(requesterId) !== this.studentId) {
      throw new UnauthorizedApplicationActionError('Only the invited Student can respond to this Invitation.');
    }
  }

  /**
   * Only the Student themselves can withdraw their Application or Membership.
   */
  assertCanWithdraw(requesterId) {
    if (String(requesterId) !== this.studentId) {
      throw new UnauthorizedApplicationActionError('Only the Student can withdraw their Application.');
    }
  }

  /**
   * Transitions status to Accepted.
   */
  accept() {
    if (this.status !== ApplicationStatus.PENDING) {
      throw new InvalidApplicationStatusTransitionError(this.status, ApplicationStatus.ACCEPTED);
    }
    this.status = ApplicationStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  /**
   * Transitions status to Rejected.
   */
  reject(reason = 'rejected_by_creator') {
    if (this.status !== ApplicationStatus.PENDING) {
      throw new InvalidApplicationStatusTransitionError(this.status, ApplicationStatus.REJECTED);
    }
    this.status = ApplicationStatus.REJECTED;
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  /**
   * Transitions status to Withdrawn.
   * Can be withdrawn from Pending (canceling application) or Accepted (leaving team).
   */
  withdraw() {
    if (this.status !== ApplicationStatus.PENDING && this.status !== ApplicationStatus.ACCEPTED) {
      throw new InvalidApplicationStatusTransitionError(this.status, ApplicationStatus.WITHDRAWN);
    }
    this.status = ApplicationStatus.WITHDRAWN;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      studentId: this.studentId,
      specialty: this.specialty,
      origin: this.origin,
      status: this.status,
      notes: this.notes,
      rejectionReason: this.rejectionReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
