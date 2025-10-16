import { GOOGLE_PLACES_KEY } from '@env';
// Google Places API configuration
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
// Simple utility functions
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
const generateSessionToken = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
export {
  GOOGLE_PLACES_BASE_URL,
  GOOGLE_PLACES_KEY,
  debounce,
  generateSessionToken,
};
