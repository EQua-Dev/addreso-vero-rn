import { GOOGLE_PLACES_BASE_URL } from '../utils/helper_functions';
// Google Places API service
class GooglePlacesService {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async getAutocompletePredictions(input, sessionToken) {
        if (!this.apiKey) {
            throw new Error('Google Places API key is required');
        }
        try {
            const params = new URLSearchParams({
                input: input.trim(),
                key: this.apiKey,
                types: 'address',
                language: 'en',
                ...(sessionToken && { sessiontoken: sessionToken }),
            });
            const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/autocomplete/json?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'OK') {
                return data.predictions.map((prediction) => ({
                    description: prediction.description,
                    place_id: prediction.place_id,
                    structured_formatting: {
                        main_text: prediction.structured_formatting?.main_text ||
                            prediction.description,
                        secondary_text: prediction.structured_formatting?.secondary_text || '',
                    },
                }));
            }
            else if (data.status === 'ZERO_RESULTS') {
                return [];
            }
            else {
                throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('Error fetching autocomplete predictions:', error);
            throw error;
        }
    }
    async getPlaceDetails(placeId, sessionToken) {
        if (!this.apiKey) {
            throw new Error('Google Places API key is required');
        }
        try {
            const params = new URLSearchParams({
                place_id: placeId,
                key: this.apiKey,
                fields: 'formatted_address,geometry,place_id,address_components',
                language: 'en',
                ...(sessionToken && { sessiontoken: sessionToken }),
            });
            const response = await fetch(`${GOOGLE_PLACES_BASE_URL}/details/json?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.status === 'OK') {
                const place = data.result;
                return {
                    address: place.formatted_address,
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng,
                    placeId: place.place_id,
                    // addressComponents: place.address_components || [],
                };
            }
            else {
                throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }
}
export default GooglePlacesService;
