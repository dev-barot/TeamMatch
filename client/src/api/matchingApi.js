import { authApi } from './authApi.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const matchingApi = {
  /**
   * Retrieves AI-ranked project recommendations for the current student (Rule R4).
   * @param {number} [limit=10]
   */
  async getMatchedProjects(limit = 10) {
    const token = authApi.getAccessToken();
    const res = await fetch(`${API_URL}/matching/projects?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch project matches.');
    }
    return data;
  },

  /**
   * Retrieves AI-ranked student candidate recommendations for a project.
   * Creator only access (Rule R2).
   * @param {string} projectId
   * @param {number} [limit=20]
   */
  async getMatchedCandidates(projectId, limit = 20) {
    const token = authApi.getAccessToken();
    const res = await fetch(`${API_URL}/matching/candidates/${projectId}?limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch candidate recommendations.');
    }
    return data;
  },
};
