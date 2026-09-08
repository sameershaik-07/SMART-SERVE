import { apiFetch } from './client';

export const getProvidersApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/providers${query ? `?${query}` : ''}`);
};

export const getProviderByIdApi = (id) => apiFetch(`/providers/${id}`);

export const getProviderDashboardApi = () => apiFetch('/providers/dashboard');

export const updateProviderProfileApi = (data) => apiFetch('/providers/profile', {
  method: 'PUT',
  body: JSON.stringify(data),
});
