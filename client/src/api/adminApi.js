import { apiRequest } from './client.js';

/**
 * Admin API client (M6)
 * All endpoints require Admin account type.
 */
export const adminApi = {
  /** List all accounts (paginated) */
  listAccounts: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', params.limit);
    if (params.offset) qs.set('offset', params.offset);
    return apiRequest(`/admin/accounts?${qs}`);
  },

  /** Deactivate a student account */
  deactivateAccount: (studentId) =>
    apiRequest(`/admin/accounts/${studentId}/deactivate`, { method: 'PATCH', body: {} }),

  /** Verify a student profile (Rule R5) */
  verifyAccount: (studentId) =>
    apiRequest(`/admin/accounts/${studentId}/verify`, { method: 'PATCH', body: {} }),

  /** Force-close a project and reject all pending applications */
  adminCloseProject: (projectId) =>
    apiRequest(`/admin/projects/${projectId}/close`, { method: 'POST', body: {} }),

  /** List all reports (optionally filter by status=pending|reviewed) */
  listReports: (status) => {
    const qs = status ? `?status=${status}` : '';
    return apiRequest(`/admin/reports${qs}`);
  },

  /** Mark a report as reviewed */
  markReportReviewed: (reportId) =>
    apiRequest(`/admin/reports/${reportId}/review`, { method: 'PATCH', body: {} }),
};

/**
 * Moderation API — student-facing report filing
 */
export const moderationApi = {
  reportStudent: (targetStudentId, reason) =>
    apiRequest('/moderation/reports/students', {
      method: 'POST',
      body: { targetStudentId, reason },
    }),

  reportConversation: (conversationId, reason) =>
    apiRequest('/moderation/reports/conversations', {
      method: 'POST',
      body: { conversationId, reason },
    }),
};
