/**
 * Report domain entity.
 * A Student's complaint about another Student or a Conversation.
 * Queued for Admin review.
 *
 * Terms from UBIQUITOUS_LANGUAGE.md:
 *  - Report: a Student's complaint, queued for Admin review
 *  - Admin: the Account of type admin who reviews Reports
 *
 * Rule R2: Only an Admin can review or dismiss Reports.
 * Rule: Admin cannot read message content; Reports expose only reported target + reason.
 */

export const REPORT_TARGET_TYPE = Object.freeze({
  STUDENT: 'student',
  CONVERSATION: 'conversation',
});

export const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
});

export class Report {
  constructor({
    id,
    reporterId,
    targetType,
    targetId,
    reason,
    status = REPORT_STATUS.PENDING,
    reviewedByAdminId = null,
    reviewedAt = null,
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    if (!id) throw new Error('Report id is required.');
    if (!reporterId) throw new Error('Report reporterId is required.');
    if (!REPORT_TARGET_TYPE[targetType?.toUpperCase()] && !Object.values(REPORT_TARGET_TYPE).includes(targetType)) {
      throw new Error(`Invalid Report targetType: "${targetType}". Must be one of: ${Object.values(REPORT_TARGET_TYPE).join(', ')}.`);
    }
    if (!targetId) throw new Error('Report targetId is required.');
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error('Report reason is required and must be a non-empty string.');
    }
    if (reason.trim().length > 500) {
      throw new Error('Report reason must be at most 500 characters.');
    }
    if (!Object.values(REPORT_STATUS).includes(status)) {
      throw new Error(`Invalid Report status: "${status}".`);
    }

    this.id = String(id);
    this.reporterId = String(reporterId);
    this.targetType = targetType;
    this.targetId = String(targetId);
    this.reason = reason.trim();
    this.status = status;
    this.reviewedByAdminId = reviewedByAdminId ? String(reviewedByAdminId) : null;
    this.reviewedAt = reviewedAt ? new Date(reviewedAt) : null;
    this.createdAt = new Date(createdAt);
    this.updatedAt = new Date(updatedAt);
  }

  isPending() {
    return this.status === REPORT_STATUS.PENDING;
  }

  isReviewed() {
    return this.status === REPORT_STATUS.REVIEWED;
  }

  /**
   * Mark this Report as reviewed by an Admin.
   * Rule R2: only Admin may call this.
   */
  markReviewed(adminId) {
    if (!adminId) throw new Error('Admin ID is required to review a Report.');
    this.status = REPORT_STATUS.REVIEWED;
    this.reviewedByAdminId = String(adminId);
    this.reviewedAt = new Date();
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      reporterId: this.reporterId,
      targetType: this.targetType,
      targetId: this.targetId,
      reason: this.reason,
      status: this.status,
      reviewedByAdminId: this.reviewedByAdminId,
      reviewedAt: this.reviewedAt ? this.reviewedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
