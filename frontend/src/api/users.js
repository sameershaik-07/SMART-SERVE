import { apiFetch } from './client';

export const getProfileApi = () => apiFetch('/users/profile');

export const updateProfileApi = (data) => apiFetch('/users/profile', {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const changePasswordApi = (data) => apiFetch('/users/change-password', {
  method: 'PUT',
  body: JSON.stringify(data),
});
