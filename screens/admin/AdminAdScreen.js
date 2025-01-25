import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../../AuthContext';

const AdminAdScreen = () => {
  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const CLOUDINARY_URL =
    'https://api.cloudinary.com/v1_1/dhe3yon5d/image/upload';
  const UPLOAD_PRESET = 'eventmate';

  const uploadImage = async selectedImage => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: `ad_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      if (response.data.secure_url) {
        setImage(response.data.secure_url);
      } else {
        Alert.alert('Error', 'Image upload failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image.');
      console.error('Cloudinary Upload Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.assets && response.assets.length > 0) {
        uploadImage(response.assets[0]);
      }
    });
  };

  const submitAd = async () => {
    if (!title || !description || !image) {
      Alert.alert('Error', 'Title, description, and image are required.');
      return;
    }

    try {
      setLoading(true);
      const adData = {
        title,
        description,
        image,
        url,
        organizer: userId,
      };

      await axios.post('https://biletixai.onrender.com/ads', adData);
      Alert.alert('Success', 'Advertisement added successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add advertisement.');
      console.error('Ad Creation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{padding: 20}}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} />
      </TouchableOpacity>

      <Text style={{fontSize: 24, fontWeight: 'bold', marginTop: 10}}>
        Add Advertisement
      </Text>

      <TextInput
        placeholder="Advertisement Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, {height: 100}]}
      />

      <TouchableOpacity onPress={selectImage} style={styles.uploadButton}>
        <Ionicons name="image-outline" size={24} />
        <Text>Upload Image</Text>
      </TouchableOpacity>

      {image && <Image source={{uri: image}} style={styles.imagePreview} />}

      <TextInput
        placeholder="URL (Optional)"
        value={url}
        onChangeText={setUrl}
        style={styles.input}
      />

      <TouchableOpacity
        onPress={submitAd}
        style={styles.submitButton}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#07bc0c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
  },
};

export default AdminAdScreen;
