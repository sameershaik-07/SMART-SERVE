import { apiFetch } from './client';

export const loginApi = (credentials) => apiFetch('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});

export const registerApi = (userData) => apiFetch('/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const verifyEmailApi = (data) => apiFetch('/auth/verify-email', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const forgotPasswordApi = (email) => apiFetch('/auth/forgot-password', {
  method: 'POST',
  body: JSON.stringify({ email }),
});

export const resetPasswordApi = (data) => apiFetch('/auth/reset-password', {
  method: 'POST',
  body: JSON.stringify(data),
});
