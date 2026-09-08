import { apiFetch } from './client';

export const getCategoriesApi = () => apiFetch('/admin/categories');

export const createCategoryApi = (data) => apiFetch('/admin/categories', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateCategoryApi = (id, data) => apiFetch(`/admin/categories/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteCategoryApi = (id) => apiFetch(`/admin/categories/${id}`, {
  method: 'DELETE',
});

export const getPendingProvidersApi = () => apiFetch('/admin/providers/pending');

export const verifyProviderApi = (id) => apiFetch(`/admin/providers/${id}/verify`, {
  method: 'PATCH',
});

export const rejectProviderApi = (id) => apiFetch(`/admin/providers/${id}/reject`, {
  method: 'PATCH',
});

export const getAdminAnalyticsApi = () => apiFetch('/admin/analytics/overview');

export const getAuditLogsApi = () => apiFetch('/admin/audit-log');

export const getAdminChatConversationsApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/admin/chat/conversations${query ? `?${query}` : ''}`);
};

export const getAdminChatMessagesApi = (id) => apiFetch(`/admin/chat/conversations/${id}/messages`);

export const sendAdminChatMessageApi = (id, data) => apiFetch(`/admin/chat/conversations/${id}/messages`, {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getAdminChatStatsApi = () => apiFetch('/admin/chat/stats');
