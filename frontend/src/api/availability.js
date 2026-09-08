import { apiFetch } from './client';

export const getMySlotsApi = () => apiFetch('/availability/my-slots');

export const getProviderSlotsApi = (providerId) => apiFetch(`/availability/provider/${providerId}`);

export const createSlotApi = (slotData) => apiFetch('/availability', {
  method: 'POST',
  body: JSON.stringify(slotData),
});

export const updateSlotApi = (id, slotData) => apiFetch(`/availability/${id}`, {
  method: 'PUT',
  body: JSON.stringify(slotData),
});

export const deleteSlotApi = (id) => apiFetch(`/availability/${id}`, {
  method: 'DELETE',
});

