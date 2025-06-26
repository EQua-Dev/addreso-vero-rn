import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { AddressVerificationFieldProps, GooglePlacesPrediction, AddressResult } from '../types';
import { ApiService } from '../services/ApiService';
import { LocationService } from '../services/LocationService';
import { requestLocationPermission } from '../utils/permissions';
import { debounce, generateSessionToken, GOOGLE_PLACES_KEY } from '../utils/helper_functions';
import GooglePlacesService from '../services/GooglePlacesService';

const AddressVerificationField: React.FC<AddressVerificationFieldProps> = ({
  config,
  onAddressSelected,
  onLocationUpdate,
  onError,
  placeholder = 'Enter your address',
  showSubmitButton = true,
  style,
  // googlePlacesApiKey, // Add this prop to pass the API key
}) => {
  const [query, setQuery] = useState(config.initialAddressText || '');
  const [suggestions, setSuggestions] = useState<GooglePlacesPrediction[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<number>(15);
  const [sessionTimeout, setSessionTimeout] = useState<number>(60);
  const [sessionToken] = useState(() => generateSessionToken());
  const [googlePlacesService] = useState(() => new GooglePlacesService(GOOGLE_PLACES_KEY || ''));

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.trim().length > 2) {
        setLoadingSuggestions(true);
        try {
          const predictions = await googlePlacesService.getAutocompletePredictions(searchQuery, sessionToken);
          setSuggestions(predictions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          onError?.(`Failed to fetch suggestions: ${error}`);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    [googlePlacesService, sessionToken, onError]
  );

  // Initialize API service and fetch config
  useEffect(() => {
    const initializeService = async () => {
      try {
        // Validate Google Places API key
        // if (!googlePlacesApiKey) {
        //   throw new Error('Google Places API key is required');
        // }

        ApiService.getInstance().configure(config.apiKey, config.customerID);
        
        const configData = await ApiService.getInstance().fetchAddressVerificationConfig();
        setPollingInterval(configData.geotaggingPollingInterval || 15);
        setSessionTimeout(configData.geotaggingSessionTimeout || 60);
        
      } catch (error) {
        console.error('Error initializing service:', error);
        onError?.(`Failed to initialize: ${error}`);
      } finally {
        setLoading(false);
      }
    };

    initializeService();
  }, [config.apiKey, config.customerID, onError]);

  // Trigger search when query changes
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleSuggestionSelect = useCallback(
    async (suggestion: GooglePlacesPrediction) => {
      try {
        setLoadingSuggestions(true);
        const placeDetails = await googlePlacesService.getPlaceDetails(suggestion.place_id, sessionToken);
        
        setSelectedAddress(placeDetails);
        setQuery(placeDetails.address);
        setSuggestions([]);
        onAddressSelected(placeDetails);
      } catch (error) {
        console.error('Error selecting address:', error);
        onError?.(`Failed to select address: ${error}`);
        Alert.alert('Error', 'Failed to get address details. Please try again.');
      } finally {
        setLoadingSuggestions(false);
      }
    },
    [onAddressSelected, onError, googlePlacesService, sessionToken]
  );

  const handleSubmit = useCallback(async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select an address first');
      return;
    }

    if (config.verifyLocation) {
      try {
        const permissionResult = await requestLocationPermission();
        if (!permissionResult.granted) {
          Alert.alert('Permission Required', 'Location permission is required for address verification');
          return;
        }

        // Start location tracking
        const locationService = LocationService.getInstance();
        locationService.startLocationTracking(
          config.locationFetchIntervalSeconds || pollingInterval,
          config.locationFetchDurationSeconds || sessionTimeout,
          onLocationUpdate
        );

        Alert.alert('Success', 'Address verification started. Location tracking is now active.');
      } catch (error) {
        console.error('Error starting location verification:', error);
        onError?.(`Failed to start location verification: ${error}`);
      }
    } else {
      Alert.alert('Success', 'Address selected successfully');
    }
  }, [selectedAddress, config, pollingInterval, sessionTimeout, onLocationUpdate, onError]);

  const handleClearAddress = useCallback(() => {
    setSelectedAddress(null);
    setQuery('');
    setSuggestions([]);
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading configuration...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor="#999"
          autoComplete="street-address"
          autoCorrect={false}
        />
        {selectedAddress && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAddress}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loadingSuggestions && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSuggestionSelect(item)}
            >
              <Text style={styles.suggestionMain}>{item.structured_formatting.main_text}</Text>
              <Text style={styles.suggestionSecondary}>{item.structured_formatting.secondary_text}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        />
      )}

      {showSubmitButton && (
        <TouchableOpacity
          style={[styles.submitButton, !selectedAddress && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!selectedAddress}
        >
          <Text style={styles.submitButtonText}>
            {config.verifyLocation ? 'Verify Address' : 'Submit Address'}
          </Text>
        </TouchableOpacity>
      )}

      {selectedAddress && (
        <View style={styles.selectedAddressContainer}>
          <Text style={styles.selectedAddressLabel}>Selected Address:</Text>
          <Text style={styles.selectedAddressText}>{selectedAddress.address}</Text>
          <Text style={styles.coordinatesText}>
            Coordinates: {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40, // Make room for clear button
    fontSize: 16,
    backgroundColor: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 8,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  suggestionsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionMain: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  suggestionSecondary: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAddressContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  selectedAddressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  selectedAddressText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddressVerificationField;