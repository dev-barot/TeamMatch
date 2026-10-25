import mongoose from 'mongoose';
import { REPORT_TARGET_TYPE, REPORT_STATUS } from '../../../domain/moderation/Report.js';

/**
 * Mongoose schema for Report documents.
 * Maps to the Report domain entity for production persistence.
 * Admin cannot read message content — only targetId + reason stored.
 */
const ReportSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  reporterId: { type: String, required: true, index: true },
  targetType: {
    type: String,
    enum: Object.values(REPORT_TARGET_TYPE),
    required: true,
    index: true,
  },
  targetId: { type: String, required: true, index: true },
  reason: { type: String, required: true, maxLength: 500 },
  status: {
    type: String,
    enum: Object.values(REPORT_STATUS),
    default: REPORT_STATUS.PENDING,
    index: true,
  },
  reviewedByAdminId: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
}, {
  timestamps: true,
  _id: false,
});

export const ReportModel = mongoose.model('Report', ReportSchema);
