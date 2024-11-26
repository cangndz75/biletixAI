import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

const AdminCreateVenueScreen = ({navigation}) => {
  const [venueData, setVenueData] = useState({
    name: '',
    rating: '',
    location: '',
    address: '',
    image: '',
  });

  const handleInputChange = (key, value) => {
    setVenueData(prevState => ({...prevState, [key]: value}));
  };

  const handleSubmit = async () => {
    if (!venueData.name || !venueData.location || !venueData.address) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      console.log('Submitting venue data:', venueData);
      const response = await axios.post(
        'https://biletixai.onrender.com/venues',
        venueData,
      );
      console.log('Response:', response.data);
      Alert.alert('Success', 'Venue created successfully!');
      navigation.goBack();
    } catch (error) {
      console.error(
        'Error creating venue:',
        error.response ? error.response.data : error.message,
      );
      Alert.alert('Error', 'Failed to create venue. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Venue</Text>

      <TextInput
        placeholder="Venue Name"
        style={styles.input}
        value={venueData.name}
        onChangeText={text => handleInputChange('name', text)}
      />

      <TextInput
        placeholder="Rating (e.g., 4.5)"
        style={styles.input}
        keyboardType="numeric"
        value={venueData.rating}
        onChangeText={text => handleInputChange('rating', text)}
      />

      <TextInput
        placeholder="Location"
        style={styles.input}
        value={venueData.location}
        onChangeText={text => handleInputChange('location', text)}
      />

      <TextInput
        placeholder="Address"
        style={styles.input}
        value={venueData.address}
        onChangeText={text => handleInputChange('address', text)}
      />

      <TextInput
        placeholder="Image URL"
        style={styles.input}
        value={venueData.image}
        onChangeText={text => handleInputChange('image', text)}
      />

      <Button title="Create Venue" onPress={handleSubmit} />

      {venueData.image ? (
        <Image source={{uri: venueData.image}} style={styles.imagePreview} />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    paddingVertical: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 20,
  },
});

export default AdminCreateVenueScreen;
