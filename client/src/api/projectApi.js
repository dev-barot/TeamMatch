import { apiRequest } from './client.js';

export const projectApi = {
  async browseProjects({
    query = '',
    skills = [],
    specialty = '',
    category = '',
    commitment = '',
    status = 'open',
    limit = 20,
    cursor = '',
  } = {}) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (skills && skills.length > 0) params.append('skills', Array.isArray(skills) ? skills.join(',') : skills);
    if (specialty) params.append('specialty', specialty);
    if (category) params.append('category', category);
    if (commitment) params.append('commitment', commitment);
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit);
    if (cursor) params.append('cursor', cursor);

    const qs = params.toString();
    return apiRequest(`/projects${qs ? `?${qs}` : ''}`);
  },

  async getProject(id) {
    return apiRequest(`/projects/${id}`);
  },

  async createProject(projectData) {
    return apiRequest('/projects', {
      method: 'POST',
      body: projectData,
    });
  },

  async updateProject(id, projectData) {
    return apiRequest(`/projects/${id}`, {
      method: 'PATCH',
      body: projectData,
    });
  },

  async closeProject(id) {
    return apiRequest(`/projects/${id}/close`, {
      method: 'POST',
    });
  },
};
