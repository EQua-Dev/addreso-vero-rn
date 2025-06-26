export interface AddressVerificationConfig {
    initialAddressText?: string;
    locationFetchIntervalSeconds?: number; // Changed to seconds for more granular control
    locationFetchDurationSeconds?: number;
    verifyLocation?: boolean;
    apiKey: string;
    customerID: string;
  }
  
  export interface AddressResult {
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  }
  
  export interface LocationPoint {
    latitude: number;
    longitude: number;
    timestamp: number;
  }
  
  export interface AddressVerificationFieldProps {
    config: AddressVerificationConfig;
    onAddressSelected: (result: AddressResult) => void;
    onLocationUpdate?: (location: LocationPoint) => void;
    onError?: (error: string) => void;
    placeholder?: string;
    showSubmitButton?: boolean;
    style?: any;
  }
  
  export interface GooglePlacesPrediction {
    description: string;
    place_id: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }
  
  export interface GooglePlacesResponse {
    predictions: GooglePlacesPrediction[];
    status: string;
  }
  
  export interface GooglePlaceDetails {
    result: {
      formatted_address: string;
      geometry: {
        location: {
          lat: number;
          lng: number;
        };
      };
      place_id: string;
    };
    status: string;
  }