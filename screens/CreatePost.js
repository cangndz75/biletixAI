import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {AuthContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhe3yon5d/image/upload';
const UPLOAD_PRESET = 'eventmate';
const API_BASE_URL = 'https://biletixai.onrender.com';

const CreatePost = () => {
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const communityId = route.params?.communityId;

  const handlePickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, async response => {
      if (
        !response.didCancel &&
        !response.errorMessage &&
        response.assets?.length > 0
      ) {
        setNewPostImage(response.assets[0]);
      }
    });
  };

  const uploadImageToCloudinary = async () => {
    if (!newPostImage) return null;

    const formData = new FormData();
    formData.append('file', {
      uri: newPostImage.uri,
      type: newPostImage.type || 'image/jpeg',
      name: newPostImage.fileName || `upload_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      return res.data.secure_url;
    } catch (error) {
      console.error(
        '❌ Cloudinary upload error:',
        error.response?.data || error.message,
      );
      return null;
    }
  };

  const handleCreatePost = async () => {
    setPosting(true);

    let uploadedImageUrl = null;
    if (newPostImage) {
      uploadedImageUrl = await uploadImageToCloudinary();
      if (!uploadedImageUrl) {
        setPosting(false);
        return; 
      }
    }

    const formData = {
      userId,
      communityId,
      description: newPostDescription,
      imageUrl: uploadedImageUrl,
    };

    try {
      await axios.post(`${API_BASE_URL}/posts/create`, formData);
      setNewPostImage(null);
      setNewPostDescription('');
      navigation.replace('PostScreen', {communityId});
    } catch (error) {
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity onPress={handleCreatePost} disabled={posting}>
          {posting ? (
            <ActivityIndicator size="small" color="#FF7F50" />
          ) : (
            <Text style={styles.postButton}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Write something..."
        value={newPostDescription}
        onChangeText={setNewPostDescription}
        multiline
      />

      {newPostImage && (
        <Image source={{uri: newPostImage.uri}} style={styles.previewImage} />
      )}

      <TouchableOpacity
        style={styles.imagePickerButton}
        onPress={handlePickImage}>
        <Ionicons name="image-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF3EB',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 100,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerButton: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{translateX: -30}],
    backgroundColor: '#FF7F50',
    padding: 15,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CreatePost;
