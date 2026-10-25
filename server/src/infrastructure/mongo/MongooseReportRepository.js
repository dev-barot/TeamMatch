import { ReportRepository } from '../../ports/ReportRepository.js';
import { Report, REPORT_STATUS } from '../../domain/moderation/Report.js';
import { ReportModel } from './schemas/ReportModel.js';

/**
 * MongooseReportRepository
 * Production implementation of ReportRepository backed by MongoDB.
 */
export class MongooseReportRepository extends ReportRepository {
  _toDomain(doc) {
    if (!doc) return null;
    return new Report({
      id: doc._id,
      reporterId: doc.reporterId,
      targetType: doc.targetType,
      targetId: doc.targetId,
      reason: doc.reason,
      status: doc.status,
      reviewedByAdminId: doc.reviewedByAdminId || null,
      reviewedAt: doc.reviewedAt || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async save(report) {
    const data = {
      _id: report.id,
      reporterId: report.reporterId,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      status: report.status,
      reviewedByAdminId: report.reviewedByAdminId || null,
      reviewedAt: report.reviewedAt || null,
    };

    await ReportModel.findByIdAndUpdate(
      report.id,
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async findById(id) {
    const doc = await ReportModel.findById(String(id)).lean();
    return this._toDomain(doc);
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.status) {
      query.status = filters.status;
    }

    const offset = filters.offset || 0;
    const limit = Math.min(filters.limit || 50, 100);

    const docs = await ReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    return docs.map((d) => this._toDomain(d));
  }

  async findByTargetId(targetId) {
    const docs = await ReportModel.find({ targetId: String(targetId) })
      .sort({ createdAt: -1 })
      .lean();
    return docs.map((d) => this._toDomain(d));
  }

  async countPending() {
    return ReportModel.countDocuments({ status: REPORT_STATUS.PENDING });
  }
}
