import Geolocation from '@react-native-community/geolocation';
import type { LocationPoint } from '../types';
import { ApiService } from './ApiService';

export class LocationService {
  private static instance: LocationService;
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private isTracking: boolean = false;
  private onLocationUpdate?: (location: LocationPoint) => void;

  private constructor() {}

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  public startLocationTracking(
    intervalSeconds: number,
    durationSeconds: number,
    onLocationUpdate?: (location: LocationPoint) => void
  ): void {
    if (this.isTracking) {
      console.log('Location tracking is already active');
      return;
    }

    this.isTracking = true;
    this.onLocationUpdate = onLocationUpdate;

    console.log(`Starting location tracking: interval=${intervalSeconds}s, duration=${durationSeconds}s`);

    // Start periodic location updates
    this.intervalId = setInterval(() => {
      this.getCurrentLocation();
    }, intervalSeconds * 1000);

    // Get initial location
    this.getCurrentLocation();

    // Stop tracking after duration
    this.timeoutId = setTimeout(() => {
      this.stopLocationTracking();
    }, durationSeconds * 1000);
  }

  public stopLocationTracking(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isTracking = false;
    this.onLocationUpdate = undefined;
    console.log('Location tracking stopped');
  }

  private getCurrentLocation(): void {
    Geolocation.getCurrentPosition(
      (position) => {
        const location: LocationPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now(),
        };

        console.log(`Location update: ${location.latitude}, ${location.longitude}`);

        // Call the callback if provided
        if (this.onLocationUpdate) {
          this.onLocationUpdate(location);
        }

        // Submit to API
        this.submitLocationToAPI(location);
      },
      (error) => {
        console.error('Error getting location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  private async submitLocationToAPI(location: LocationPoint): Promise<void> {
    try {
      await ApiService.getInstance().submitLocationForVerification(location);
    } catch (error) {
      console.error('Failed to submit location to API:', error);
    }
  }

  public isCurrentlyTracking(): boolean {
    return this.isTracking;
  }
}