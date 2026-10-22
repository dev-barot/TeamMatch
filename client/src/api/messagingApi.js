import { apiRequest } from './client.js';

export const messagingApi = {
  listConversations: async () => {
    return apiRequest('/conversations');
  },

  startConversation: async (counterpartyId) => {
    return apiRequest('/conversations', {
      method: 'POST',
      body: { counterpartyId },
    });
  },

  listMessages: async (conversationId) => {
    return apiRequest(`/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId, content) => {
    return apiRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { content },
    });
  },

  listNotifications: async () => {
    return apiRequest('/notifications');
  },

  markNotificationRead: async (notificationId) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};
