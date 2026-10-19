import { apiRequest } from './client.js';

export const studentApi = {
  async getMe() {
    return apiRequest('/students/me');
  },

  async updateProfile(studentId, profileData) {
    return apiRequest(`/students/${studentId}/profile`, {
      method: 'PATCH',
      body: profileData,
    });
  },

  async getPublicProfile(studentId) {
    return apiRequest(`/students/${studentId}`);
  },
};
