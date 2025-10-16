import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, } from 'react-native';
import { ApiService } from '../services/ApiService';
import { LocationService } from '../services/LocationService';
import { requestLocationPermission } from '../utils/permissions';
import { debounce, generateSessionToken, GOOGLE_PLACES_KEY, } from '../utils/helper_functions';
import GooglePlacesService from '../services/GooglePlacesService';
const AddressVerificationField = ({ config, onAddressSelected, onLocationUpdate, onError, chooseAddressType, addressTypes, onAddressTypeChange, placeholder = 'Enter your address', showSubmitButton = true, style,
// googlePlacesApiKey, // Add this prop to pass the API key
 }) => {
    const [query, setQuery] = useState(config.initialAddressText || '');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(15);
    const [sessionTimeout, setSessionTimeout] = useState(60);
    const [sessionToken] = useState(() => generateSessionToken());
    const [googlePlacesService] = useState(() => new GooglePlacesService(GOOGLE_PLACES_KEY || ''));
    // Debounced search function
    const debouncedSearch = useCallback(debounce(async (searchQuery) => {
        if (searchQuery.trim().length > 2) {
            setLoadingSuggestions(true);
            try {
                const predictions = await googlePlacesService.getAutocompletePredictions(searchQuery, sessionToken);
                console.log('predictions', predictions);
                if (Array.isArray(predictions)) {
                    setSuggestions(predictions);
                }
                else {
                    console.warn('GooglePlacesService returned non-array predictions:', predictions);
                    setSuggestions([]); // fallback to empty
                }
            }
            catch (error) {
                console.error('Error fetching suggestions:', error);
                onError?.(`Failed to fetch suggestions: ${error}`);
                setSuggestions([]);
            }
            finally {
                setLoadingSuggestions(false);
            }
        }
        else {
            setSuggestions([]);
        }
    }, 300), [googlePlacesService, sessionToken, onError]);
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
            }
            catch (error) {
                console.error('Error initializing service:', error);
                onError?.(`Failed to initialize: ${error}`);
            }
            finally {
                setLoading(false);
            }
        };
        initializeService();
    }, [config.apiKey, config.customerID, onError]);
    // Trigger search when query changes
    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);
    const handleSuggestionSelect = useCallback(async (suggestion) => {
        try {
            setLoadingSuggestions(true);
            const placeDetails = await googlePlacesService.getPlaceDetails(suggestion.place_id, sessionToken);
            setSelectedAddress(placeDetails);
            setQuery(placeDetails.address);
            setSuggestions([]);
            onAddressSelected(placeDetails);
        }
        catch (error) {
            console.error('Error selecting address:', error);
            onError?.(`Failed to select address: ${error}`);
            Alert.alert('Error', 'Failed to get address details. Please try again.');
        }
        finally {
            setLoadingSuggestions(false);
        }
    }, [onAddressSelected, onError, googlePlacesService, sessionToken]);
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
                locationService.startLocationTracking(config.locationFetchIntervalSeconds || pollingInterval, config.locationFetchDurationSeconds || sessionTimeout, onLocationUpdate);
                Alert.alert('Success', 'Address verification started. Location tracking is now active.');
            }
            catch (error) {
                console.error('Error starting location verification:', error);
                onError?.(`Failed to start location verification: ${error}`);
            }
        }
        else {
            Alert.alert('Success', 'Address selected successfully');
        }
    }, [
        selectedAddress,
        config,
        pollingInterval,
        sessionTimeout,
        onLocationUpdate,
        onError,
    ]);
    const handleClearAddress = useCallback(() => {
        setSelectedAddress(null);
        setQuery('');
        setSuggestions([]);
    }, []);
    if (loading) {
        return (_jsxs(View, { style: [styles.container, style], children: [_jsx(ActivityIndicator, { size: "large", color: "#0000ff" }), _jsx(Text, { style: styles.loadingText, children: "Loading configuration..." })] }));
    }
    return (_jsxs(View, { style: [styles.container, style], children: [_jsxs(View, { style: styles.inputContainer, children: [chooseAddressType && addressTypes?.length > 0 && (_jsx(View, { style: styles.addressTypeContainer, children: addressTypes.map((type) => (_jsx(TouchableOpacity, { style: [
                                styles.addressTypeButton,
                                selectedType === type && styles.addressTypeButtonSelected,
                            ], onPress: () => {
                                setSelectedType(type);
                                onAddressTypeChange?.(type);
                            }, children: _jsx(Text, { style: [
                                    styles.addressTypeText,
                                    selectedType === type && styles.addressTypeTextSelected,
                                ], children: type }) }, type))) })), _jsx(TextInput, { style: styles.textInput, value: query, onChangeText: setQuery, placeholder: placeholder, placeholderTextColor: "#999", autoComplete: "street-address", autoCorrect: false, keyboardAppearance: "light" }), selectedAddress && (_jsx(TouchableOpacity, { style: styles.clearButton, onPress: handleClearAddress, children: _jsx(Text, { style: styles.clearButtonText, children: "\u2715" }) }))] }), loadingSuggestions && (_jsx(View, { style: styles.loadingContainer, children: _jsx(ActivityIndicator, { size: "small", color: "#0000ff" }) })), suggestions.length > 0 && (_jsx(FlatList, { data: suggestions, keyExtractor: (item) => item.place_id, renderItem: ({ item }) => (_jsxs(TouchableOpacity, { style: styles.suggestionItem, onPress: () => handleSuggestionSelect(item), children: [_jsx(Text, { style: styles.suggestionMain, children: item.structured_formatting.main_text }), _jsx(Text, { style: styles.suggestionSecondary, children: item.structured_formatting.secondary_text })] })), style: styles.suggestionsList, nestedScrollEnabled: true, keyboardShouldPersistTaps: "handled" })), showSubmitButton && (_jsx(TouchableOpacity, { style: [
                    styles.submitButton,
                    !selectedAddress && styles.submitButtonDisabled,
                ], onPress: handleSubmit, disabled: !selectedAddress, children: _jsx(Text, { style: styles.submitButtonText, children: config.verifyLocation ? 'Verify Address' : 'Submit Address' }) })), selectedAddress && (_jsxs(View, { style: styles.selectedAddressContainer, children: [_jsx(Text, { style: styles.selectedAddressLabel, children: "Selected Address:" }), _jsx(Text, { style: styles.selectedAddressText, children: selectedAddress.address }), _jsxs(Text, { style: styles.coordinatesText, children: ["Coordinates: ", selectedAddress.latitude.toFixed(6), ",", ' ', selectedAddress.longitude.toFixed(6)] })] }))] }));
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
        color: '#000',
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
    addressTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 12,
        gap: 8,
    },
    addressTypeButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
    },
    addressTypeButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    addressTypeText: {
        color: '#333',
        fontSize: 14,
    },
    addressTypeTextSelected: {
        color: '#fff',
        fontWeight: '600',
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
