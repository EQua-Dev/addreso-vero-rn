//index.tsx
import { ApiService } from './services/ApiService';
import { LocationService } from './services/LocationService';
// Main exports
export { default as AddressVerificationField } from './components/AddressVerificationField';
// Export services
export { ApiService } from './services/ApiService';
export { LocationService } from './services/LocationService';
// Export utilities
export {
  requestLocationPermission,
  checkLocationPermission,
} from './utils/permissions';
// Convenience function to create the library
export const createAddressVerification = (config) => {
  return {
    config,
    ApiService: ApiService.getInstance(),
    LocationService: LocationService.getInstance(),
  };
};
