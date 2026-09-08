import { apiFetch } from './client';

export const createBookingApi = (bookingData) => apiFetch('/bookings', {
  method: 'POST',
  body: JSON.stringify(bookingData),
});

export const getCustomerBookingsApi = () => apiFetch('/bookings/customer');

export const getProviderBookingsApi = () => apiFetch('/bookings/provider');

export const getBookingByIdApi = (id) => apiFetch(`/bookings/${id}`);

export const getBookingTrackingApi = (id) => apiFetch(`/bookings/${id}/tracking`);

export const updateBookingStatusApi = (id, status) => apiFetch(`/bookings/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});

export const updateBookingLocationApi = (id, locationData) => apiFetch(`/bookings/${id}/location`, {
  method: 'PATCH',
  body: JSON.stringify(locationData),
});
