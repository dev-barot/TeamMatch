import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import {
  UnauthorizedAdminActionError,
  ReportNotFoundError,
  ReportAlreadyReviewedError,
} from '../../domain/moderation/errors.js';

/**
 * Use Case: MarkReportReviewed
 * Admin marks a Report as reviewed after taking action.
 *
 * Rule R2: Only Admin may review Reports.
 * Invariant: A Report already in 'reviewed' status cannot be re-reviewed.
 */
export class MarkReportReviewed {
  constructor({ reportRepository }) {
    this.reportRepo = reportRepository;
  }

  async execute({ reportId, adminId, requesterAccountType }) {
    if (requesterAccountType !== ACCOUNT_TYPES.ADMIN) {
      throw new UnauthorizedAdminActionError('Only an Admin can mark a Report as reviewed (R2).');
    }

    const report = await this.reportRepo.findById(reportId);
    if (!report) {
      throw new ReportNotFoundError(reportId);
    }

    if (report.isReviewed()) {
      throw new ReportAlreadyReviewedError(reportId);
    }

    // Domain method on Report aggregate
    report.markReviewed(adminId);
    await this.reportRepo.save(report);

    return report.toJSON();
  }
}
