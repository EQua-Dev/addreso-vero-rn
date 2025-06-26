import { ApiService } from './services/ApiService';
import { LocationService } from './services/LocationService';
import type { AddressVerificationConfig } from './types';

// Main exports
export { default as AddressVerificationField } from './components/AddressVerificationField';

// Export types
export type {
  AddressVerificationConfig,
  AddressResult,
  LocationPoint,
  AddressVerificationFieldProps,
  GooglePlacesPrediction,
  GooglePlacesResponse,
  GooglePlaceDetails,
} from './types';

// Export services
export { ApiService } from './services/ApiService';
export { LocationService } from './services/LocationService';

// Export utilities
export { requestLocationPermission, checkLocationPermission } from './utils/permissions';

// Convenience function to create the library
export const createAddressVerification = (config: AddressVerificationConfig) => {
  return {
    config,
    ApiService: ApiService.getInstance(),
    LocationService: LocationService.getInstance(),
  };
};