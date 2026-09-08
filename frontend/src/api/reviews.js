import { apiFetch } from './client';

export const createReviewApi = (reviewData) => apiFetch('/reviews', {
  method: 'POST',
  body: JSON.stringify(reviewData),
});
