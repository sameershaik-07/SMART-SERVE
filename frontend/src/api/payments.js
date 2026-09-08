import { apiFetch } from './client';

export const createPaymentOrderApi = (data) => apiFetch('/payments/create-order', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const verifyPaymentApi = (data) => apiFetch('/payments/verify', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getPaymentByBookingApi = (bookingId) => apiFetch(`/payments/booking/${bookingId}`);

export const refundPaymentApi = (bookingId) => apiFetch(`/payments/${bookingId}/refund`, {
  method: 'POST',
});
