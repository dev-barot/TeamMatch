import { ReportRepository } from '../../ports/ReportRepository.js';
import { REPORT_STATUS } from '../../domain/moderation/Report.js';

/**
 * InMemoryReportRepository
 * In-memory implementation of ReportRepository for dev and testing.
 */
export class InMemoryReportRepository extends ReportRepository {
  constructor() {
    super();
    this.reports = new Map();
  }

  async save(report) {
    this.reports.set(report.id, report);
  }

  async findById(id) {
    return this.reports.get(String(id)) || null;
  }

  async findAll(filters = {}) {
    let results = Array.from(this.reports.values());

    if (filters.status) {
      results = results.filter((r) => r.status === filters.status);
    }

    // Sort newest first
    results.sort((a, b) => b.createdAt - a.createdAt);

    const offset = filters.offset || 0;
    const limit = filters.limit || 50;
    return results.slice(offset, offset + limit);
  }

  async findByTargetId(targetId) {
    const results = [];
    for (const report of this.reports.values()) {
      if (report.targetId === String(targetId)) {
        results.push(report);
      }
    }
    return results.sort((a, b) => b.createdAt - a.createdAt);
  }

  /** Returns count of pending Reports (for admin badge) */
  async countPending() {
    let count = 0;
    for (const report of this.reports.values()) {
      if (report.status === REPORT_STATUS.PENDING) count++;
    }
    return count;
  }

  clear() {
    this.reports.clear();
  }
}
