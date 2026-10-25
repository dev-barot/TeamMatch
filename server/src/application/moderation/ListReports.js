import { ACCOUNT_TYPES } from '../../domain/identity/Account.js';
import { UnauthorizedAdminActionError } from '../../domain/moderation/errors.js';
import { REPORT_STATUS } from '../../domain/moderation/Report.js';

/**
 * Use Case: ListReports
 * Admin views all Reports (optionally filtered by status).
 * Reports expose only: reporter, target, reason — never message content.
 *
 * Rule R2: Only Admin may list Reports.
 */
export class ListReports {
  constructor({ reportRepository }) {
    this.reportRepo = reportRepository;
  }

  async execute({ requesterAccountType, filters = {} }) {
    if (requesterAccountType !== ACCOUNT_TYPES.ADMIN) {
      throw new UnauthorizedAdminActionError('Only an Admin can list Reports (R2).');
    }

    const validStatuses = Object.values(REPORT_STATUS);
    const statusFilter = filters.status && validStatuses.includes(filters.status)
      ? filters.status
      : undefined;

    const limit = Math.min(Number(filters.limit) || 50, 100);
    const offset = Number(filters.offset) || 0;

    const reports = await this.reportRepo.findAll({
      status: statusFilter,
      limit,
      offset,
    });

    return reports.map((r) => r.toJSON());
  }
}
