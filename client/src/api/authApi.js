import { apiRequest } from './client.js';

export const authApi = {
  async signup(data) {
    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: data,
    });
    return res;
  },

  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (res.accessToken) {
      localStorage.setItem('tm_access_token', res.accessToken);
      localStorage.setItem('tm_refresh_token', res.refreshToken);
      localStorage.setItem('tm_current_user', JSON.stringify(res.student));
    }
    return res;
  },

  async verifyEmail(token) {
    return apiRequest('/auth/verify-email', {
      method: 'POST',
      body: { token },
    });
  },

  logout() {
    localStorage.removeItem('tm_access_token');
    localStorage.removeItem('tm_refresh_token');
    localStorage.removeItem('tm_current_user');
  },

  getCurrentUser() {
    const raw = localStorage.getItem('tm_current_user');
    return raw ? JSON.parse(raw) : null;
  },
};
