import { apiFetch } from './client';

export const getConversationsApi = () => {
  return apiFetch('/chat/conversations');
};

export const createOrGetConversationApi = (providerId, bookingId = null) => {
  return apiFetch('/chat/conversations', {
    method: 'POST',
    body: JSON.stringify({
      providerId: Number(providerId),
      ...(bookingId ? { bookingId: Number(bookingId) } : {}),
    }),
  });
};

export const getMessagesApi = (conversationId, page = 1, limit = 50, skipCount = false) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (skipCount) params.set('skipCount', 'true');
  return apiFetch(`/chat/conversations/${conversationId}/messages?${params.toString()}`);
};

export const sendMessageApi = (conversationId, message, messageType = 'TEXT') => {
  return apiFetch(`/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, messageType }),
  });
};

export const markMessagesReadApi = (conversationId) => {
  return apiFetch(`/chat/conversations/${conversationId}/read`, {
    method: 'PATCH',
  });
};

