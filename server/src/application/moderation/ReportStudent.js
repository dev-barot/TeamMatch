import { Report, REPORT_TARGET_TYPE } from '../../domain/moderation/Report.js';
import { StudentNotFoundError } from '../../domain/identity/errors.js';

/**
 * Use Case: ReportStudent
 * A Student files a complaint about another Student for Admin review.
 * Completes M5 step 7 — Report domain entity consumed here.
 *
 * Rule: Admin cannot read message content proactively; Reports expose only
 *       reported target + reason (M6 spec).
 */
export class ReportStudent {
  constructor({ studentRepository, reportRepository }) {
    this.studentRepo = studentRepository;
    this.reportRepo = reportRepository;
  }

  async execute({ reporterId, targetStudentId, reason }) {
    // Guard: reporter and target must exist and be different
    if (String(reporterId) === String(targetStudentId)) {
      throw new Error('A Student cannot report themselves.');
    }

    const reporter = await this.studentRepo.findById(reporterId);
    if (!reporter) {
      throw new StudentNotFoundError(reporterId);
    }

    const target = await this.studentRepo.findById(targetStudentId);
    if (!target) {
      throw new StudentNotFoundError(targetStudentId);
    }

    const report = new Report({
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      reporterId: String(reporterId),
      targetType: REPORT_TARGET_TYPE.STUDENT,
      targetId: String(targetStudentId),
      reason,
    });

    await this.reportRepo.save(report);

    return report.toJSON();
  }
}
