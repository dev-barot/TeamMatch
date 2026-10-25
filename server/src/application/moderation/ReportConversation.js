import { Report, REPORT_TARGET_TYPE } from '../../domain/moderation/Report.js';

/**
 * Use Case: ReportConversation
 * A Student reports a Conversation to flag inappropriate messaging.
 * Completes M5 step 7 — Report domain entity consumed here.
 *
 * Rule: Admin cannot read message content proactively; Reports expose only
 *       the reported Conversation ID + reason (no message content in Report).
 */
export class ReportConversation {
  constructor({ conversationRepository, reportRepository }) {
    this.conversationRepo = conversationRepository;
    this.reportRepo = reportRepository;
  }

  async execute({ reporterId, conversationId, reason }) {
    // Verify conversation exists and reporter is a participant
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found.');
    }

    const isParticipant = conversation.participantIds.includes(String(reporterId));
    if (!isParticipant) {
      throw new Error('Only a participant of the Conversation may report it.');
    }

    const report = new Report({
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      reporterId: String(reporterId),
      targetType: REPORT_TARGET_TYPE.CONVERSATION,
      targetId: String(conversationId),
      reason,
    });

    await this.reportRepo.save(report);

    return report.toJSON();
  }
}
