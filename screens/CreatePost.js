import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import {AuthContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';

const CreatePost = () => {
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [posting, setPosting] = useState(false);

  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  const communityId = route.params?.communityId;

  // 🔥 Eğer `communityId` eksikse `PostScreen`'e yönlendir
  useEffect(() => {
    if (!communityId) {
      console.error(
        "❌ 'communityId' parametresi eksik! PostScreen'e yönlendiriliyor...",
      );
      Alert.alert('Hata', 'Topluluk bilgisi eksik, geri dönülüyor.', [
        {text: 'Tamam', onPress: () => navigation.goBack()},
      ]);
    }
  }, [communityId]);

  const handlePickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (!response.didCancel && !response.errorMessage) {
        setNewPostImage(response.assets[0]);
      }
    });
  };

  const handleCreatePost = async () => {
    if (!newPostDescription.trim()) {
      Alert.alert('Hata', 'Lütfen bir açıklama girin.');
      return;
    }

    setPosting(true);
    const formData = new FormData();
    formData.append('description', newPostDescription);
    formData.append('userId', userId);
    formData.append('communityId', communityId);

    if (newPostImage) {
      formData.append('image', {
        uri: newPostImage.uri.replace('file://', ''),
        type: newPostImage.type || 'image/jpeg',
        name: newPostImage.fileName || `upload_${Date.now()}.jpg`,
      });
    }

    try {
      await axios.post(
        'https://biletixai.onrender.com/posts/create',
        formData,
        {headers: {'Content-Type': 'multipart/form-data'}},
      );

      setNewPostDescription('');
      setNewPostImage(null);
      navigation.goBack();
    } catch (error) {
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
        <Text style={styles.title}>Yeni Gönderi</Text>
        <View style={{width: 30}} />
      </View>

      <TextInput
        placeholder="Açıklama giriniz..."
        style={styles.textInput}
        value={newPostDescription}
        onChangeText={setNewPostDescription}
      />
      {newPostImage && (
        <Image source={{uri: newPostImage.uri}} style={styles.previewImage} />
      )}
      <TouchableOpacity
        style={styles.imagePickerButton}
        onPress={handlePickImage}>
        <Ionicons name="image-outline" size={20} color="white" />
        <Text style={styles.imagePickerButtonText}>Resim Seç</Text>
      </TouchableOpacity>
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
  textInput: {
    width: '100%',
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
