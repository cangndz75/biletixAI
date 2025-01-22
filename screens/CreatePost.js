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
import Config from 'react-native-config';

const CLOUDINARY_URL = Config.CLOUDINARY_URL;
const UPLOAD_PRESET = Config.UPLOAD_PRESET;
const API_BASE_URL = Config.API_BASE_URL;

const CreatePost = () => {
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [posting, setPosting] = useState(false);
  const {userId, userProfileImage, userName} = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const communityId = route.params?.communityId;

  const handlePickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, async response => {
      console.log('📷 Image Picker Response:', response);

      if (
        !response.didCancel &&
        !response.errorMessage &&
        response.assets?.length > 0
      ) {
        console.log('✅ Seçilen Resim:', response.assets[0]);
        setNewPostImage(response.assets[0]);
      } else {
        console.warn(
          '⚠️ Resim seçilmedi veya hata oluştu:',
          response.errorMessage,
        );
      }
    });
  };

  const uploadImageToCloudinary = async () => {
    if (!newPostImage || !newPostImage.uri) {
      console.warn('⚠️ Cloudinary upload skipped: No image selected.');
      return null;
    }

    console.log('🚀 Uploading image to Cloudinary:', newPostImage.uri);

    const formData = new FormData();
    formData.append('file', {
      uri: newPostImage.uri,
      type: newPostImage.type || 'image/jpeg',
      name: newPostImage.fileName || `upload_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      console.log('🔍 Cloudinary URL:', CLOUDINARY_URL);
      console.log('🔍 Upload Preset:', UPLOAD_PRESET);

      if (!CLOUDINARY_URL || !UPLOAD_PRESET) {
        console.error('❌ Cloudinary ayarları eksik!');
        Alert.alert('Hata', 'Cloudinary yapılandırması eksik.');
        return null;
      }

      const res = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      console.log('✅ Cloudinary Upload Success:', res.data);
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

    const uploadedImageUrl = await uploadImageToCloudinary();
    if (!uploadedImageUrl) {
      Alert.alert('Hata', 'Resim yüklenemedi.');
      setPosting(false);
      return;
    }

    const formData = {
      userId,
      communityId,
      description: newPostDescription,
      imageUrl: uploadedImageUrl,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/posts/create`,
        formData,
      );
      console.log('✅ Post oluşturuldu:', response.data);
      setNewPostImage(null);
      setNewPostDescription('');

      navigation.replace('PostScreen', {communityId});
    } catch (error) {
      console.error(
        '❌ Post oluşturma hatası:',
        error.response?.data || error.message,
      );
      Alert.alert('Hata', 'Post oluşturulamadı.');
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
        <View style={{width: 30}} />
      </View>

      <TextInput
        style={styles.descriptionInput}
        placeholder="Açıklama giriniz..."
        value={newPostDescription}
        onChangeText={setNewPostDescription}
        multiline
      />

      {newPostImage ? (
        <Image
          source={{
            uri:
              newPostImage?.uri ||
              'https://coffective.com/wp-content/uploads/2018/06/default-featured-image.png.jpg',
          }}
          style={styles.previewImage}
        />
      ) : (
        <TouchableOpacity
          style={styles.imagePickerButton}
          onPress={handlePickImage}>
          <Ionicons name="image-outline" size={20} color="white" />
          <Text style={styles.imagePickerButtonText}>Resim Seç</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleCreatePost}
        disabled={posting}>
        {posting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Paylaş</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 15,
    justifyContent: 'space-between',
  },
  title: {fontSize: 20, fontWeight: 'bold'},
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  userName: {fontSize: 16, fontWeight: 'bold'},
  privacyText: {fontSize: 12, color: '#555'},
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'center',
  },
  imagePickerButtonText: {color: 'white', marginLeft: 5},
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  submitButtonText: {color: 'white', fontWeight: 'bold'},
});

export default CreatePost;
