import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface PermissionResult {
  granted: boolean;
  error?: string;
}

export const requestLocationPermission =
  async (): Promise<PermissionResult> => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to location for address verification.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return { granted: false, error: 'Location permission denied' };
        }
      } else {
        // iOS - request permission through Geolocation
        return new Promise((resolve) => {
          Geolocation.requestAuthorization(
            () => resolve({ granted: true }),
            (error) => resolve({ granted: false, error: error.message })
          );
        });
      }
    } catch (error) {
      return { granted: false, error: `Permission request failed: ${error}` };
    }
  };

export const checkLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted;
    } else {
      // For iOS, we'll check when we try to get location
      return true;
    }
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};
