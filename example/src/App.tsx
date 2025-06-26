import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';

import {
  AddressVerificationField,
  type AddressVerificationConfig,
  type AddressResult,
  type LocationPoint,
} from 'sid-address-verification-react-native';

const App = () => {
  // Form state
  const [email, setEmail] = useState('demo@email.com');
  const [customerID, setCustomerID] = useState('68515eff6387fbcc00298a20');
  const [apiKey, setApiKey] = useState('sk_rd_v1_ChoPcUQjtI9pMTivjYJ9hKXop0WeXO');
  const [name, setName] = useState('John Doe');
  const [allowVerification, setAllowVerification] = useState(true);
  const [showField, setShowField] = useState(false);

  // Selected address output
  const [selectedAddress, setSelectedAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });

  const config: AddressVerificationConfig = {
    apiKey: apiKey || 'sk_rd_v1_ChoPcUQjtI9pMTivjYJ9hKXop0WeXO',
    customerID: customerID || '68515eff6387fbcc00298a20',
    verifyLocation: allowVerification,
    locationFetchIntervalSeconds: 15,
    locationFetchDurationSeconds: 60,
  };

  const handleAddressSelected = (result: AddressResult) => {
    setSelectedAddress(result.address);
    setCoordinates({ lat: result.latitude, lng: result.longitude });
  };

  const handleLocationUpdate = (location: LocationPoint) => {
    console.log('Location update:', location);
    // You can update UI or perform other actions here
  };

  const handleError = (error: string) => {
    Alert.alert('Error', error);
  };

  const handleIntegrate = () => {
    setShowField(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.content}>
          {/* Logo placeholder */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SourceID</Text>
          </View>
          
          <Text style={styles.title}>Address Verification Demo</Text>

          {/* Form fields */}
          <View style={styles.formContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Customer ID</Text>
            <TextInput
              style={styles.textInput}
              value={customerID}
              onChangeText={setCustomerID}
              placeholder="Enter customer ID"
            />

            <Text style={styles.label}>API Key</Text>
            <TextInput
              style={styles.textInput}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="Enter API key"
              secureTextEntry
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
            />

            {/* Toggle for verification */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Allow Verification</Text>
              <Switch
                value={allowVerification}
                onValueChange={setAllowVerification}
              />
            </View>

            {/* Integrate button */}
            <TouchableOpacity style={styles.integrateButton} onPress={handleIntegrate}>
              <Text style={styles.integrateButtonText}>Integrate</Text>
            </TouchableOpacity>
          </View>

          {/* Address Verification Field */}
          {showField && (
            <View style={styles.addressFieldContainer}>
              <AddressVerificationField
                config={config}
                onAddressSelected={handleAddressSelected}
                onLocationUpdate={handleLocationUpdate}
                onError={handleError}
                placeholder="Enter your address"
                showSubmitButton={true}
                style={styles.addressField}
              />
            </View>
          )}

          {/* Selected address display */}
          {selectedAddress && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Selected Address:</Text>
              <Text style={styles.resultText}>{selectedAddress}</Text>
              <Text style={styles.resultLabel}>Coordinates:</Text>
              <Text style={styles.resultText}>
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  integrateButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  integrateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressFieldContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressField: {
    // Additional styling for the address field
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#666',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
});

export default App;