// Google Places API configuration
const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GOOGLE_PLACES_KEY = 'AIzaSyD61uSS05BewaP-7NZ5LNDSnQ_D0yv-_Dk';

// Simple utility functions
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export { GOOGLE_PLACES_BASE_URL, GOOGLE_PLACES_KEY, debounce, generateSessionToken };