import { apiRequest } from './client.js';

export const applicationApi = {
  async apply(projectId, specialty, notes = '') {
    return apiRequest('/applications', {
      method: 'POST',
      body: { projectId, specialty, notes },
    });
  },

  async inviteStudent(projectId, studentId, specialty, notes = '') {
    return apiRequest(`/applications/projects/${projectId}/invitations`, {
      method: 'POST',
      body: { studentId, specialty, notes },
    });
  },

  async getMyApplications() {
    return apiRequest('/applications/me');
  },

  async getProjectApplications(projectId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.specialty) params.append('specialty', filters.specialty);

    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/applications/projects/${projectId}${qs}`);
  },

  async decideApplication(applicationId, decision, rejectionReason) {
    return apiRequest(`/applications/${applicationId}/decide`, {
      method: 'PATCH',
      body: { decision, rejectionReason },
    });
  },

  async respondToInvitation(applicationId, decision) {
    return apiRequest(`/applications/${applicationId}/respond`, {
      method: 'PATCH',
      body: { decision },
    });
  },

  async withdrawApplication(applicationId) {
    return apiRequest(`/applications/${applicationId}/withdraw`, {
      method: 'POST',
    });
  },
};
