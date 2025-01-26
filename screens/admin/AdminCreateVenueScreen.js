import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhe3yon5d/image/upload';
const UPLOAD_PRESET = 'eventmate';

const AdminCreateVenueScreen = ({navigation}) => {
  const [venueData, setVenueData] = useState({
    name: '',
    rating: '',
    location: '',
    address: '',
    image: '',
  });
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (key, value) => {
    setVenueData(prevState => ({...prevState, [key]: value}));
  };

  const openImagePicker = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets) {
        const imageUri = response.assets[0].uri;
        uploadImageToCloudinary(imageUri);
      }
    });
  };

  const uploadImageToCloudinary = async imageUri => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `venue_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data.secure_url) {
        setVenueData(prevState => ({
          ...prevState,
          image: response.data.secure_url,
        }));
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        Alert.alert('Error', 'Failed to upload image.');
      }
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setUploading(false);
    }
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

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

      <TouchableOpacity onPress={openImagePicker} style={styles.uploadButton}>
        {uploading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.uploadText}>
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />{' '}
            Upload Image
          </Text>
        )}
      </TouchableOpacity>

      {venueData.image ? (
        <Image source={{uri: venueData.image}} style={styles.imagePreview} />
      ) : null}

      <TouchableOpacity onPress={handleSubmit} style={styles.createButton}>
        <Text style={styles.createButtonText}>Create Venue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    flexGrow: 1,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    elevation: 2,
  },
  uploadButton: {
    width: '100%',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    resizeMode: 'cover',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  createButton: {
    width: '100%',
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AdminCreateVenueScreen;
