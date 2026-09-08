import { apiFetch } from './client';

export const getServicesApi = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/services${query ? `?${query}` : ''}`);
};

export const getServiceByIdApi = (id) => apiFetch(`/services/${id}`);

export const getProviderServicesApi = (providerId) => apiFetch(`/services/provider/${providerId}`);
export const getMyServicesApi = () => apiFetch('/services/my-services');

export const createServiceApi = (data) => apiFetch('/services', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const updateServiceApi = (id, data) => apiFetch(`/services/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteServiceApi = (id) => apiFetch(`/services/${id}`, {
  method: 'DELETE',
});
