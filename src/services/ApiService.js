export class ApiService {
    static instance;
    apiKey = '';
    customerID = '';
    constructor() { }
    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
    configure(apiKey, customerID) {
        this.apiKey = apiKey;
        this.customerID = customerID;
    }
    // Fetch address verification config
    async fetchAddressVerificationConfig() {
        try {
            const response = await fetch('https://api.rd.usesourceid.com/v1/api/organization/address-verification-config', {
                method: 'GET',
                headers: {
                    'accept': '*/*',
                    'x-api-key': this.apiKey,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            return data.data;
        }
        catch (error) {
            console.error('Error fetching address verification config:', error);
            throw error;
        }
    }
    // Google Places Autocomplete
    async getPlacesAutocomplete(query, googleApiKey) {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${googleApiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching places autocomplete:', error);
            throw error;
        }
    }
    // Google Place Details
    async getPlaceDetails(placeId, googleApiKey) {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${googleApiKey}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching place details:', error);
            throw error;
        }
    }
    // Submit location for verification
    async submitLocationForVerification(location) {
        try {
            const payload = {
                country: 'United States',
                reference: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                identity: this.customerID,
                verificationLevel: 'basic',
                longitude: location.longitude,
                latitude: location.latitude,
                addressLineOne: '123 Main Street', // This should be dynamic based on selected address
                addressLineTwo: 'Apt 4B',
                city: 'New York',
                region: 'New York',
                countryCode: 'US',
                postalCode: '10001',
                zipCode: '10001',
            };
            const response = await fetch('https://api.rd.usesourceid.com/v1/api/verification/address', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            console.log('Location verification result:', result);
        }
        catch (error) {
            console.error('Error submitting location for verification:', error);
            throw error;
        }
    }
}
