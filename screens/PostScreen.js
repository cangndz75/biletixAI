import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
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
import {useRoute} from '@react-navigation/native';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const {user, userId: contextUserId} = useContext(AuthContext);
  const [userId, setUserId] = useState(contextUserId);

  const route = useRoute();
  const {communityId} = route.params;

  useEffect(() => {
    fetchCommunityPosts();
  }, [communityId]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!userId) {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserId(parsedUser._id);
            console.log('🟢 AsyncStorage Kullanıcı ID:', parsedUser._id);
          } else {
            console.warn('❌ Kullanıcı bilgisi bulunamadı!');
          }
        } catch (error) {
          console.error('❌ Kullanıcı ID yüklenirken hata:', error);
        }
      }
    };
    fetchUserId();
  }, [user, userId]);

  const fetchCommunityPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/communities/${communityId}/posts`,
      );
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handlePickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (!response.didCancel && !response.errorMessage) {
        setNewPostImage(response.assets[0]);
      }
    });
  };

  const handleCreatePost = async () => {
    if (!newPostDescription.trim()) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    if (!userId || !communityId) {
      Alert.alert('Error', 'User ID or Community ID is missing.');
      console.error('❌ Eksik userId veya communityId:', {userId, communityId});
      return;
    }

    console.log('📤 Post Gönderiliyor:', {
      description: newPostDescription,
      userId,
      communityId,
      image: newPostImage ? newPostImage.uri : null,
    });

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
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('✅ Post Başarıyla Oluşturuldu');
      setModalVisible(false);
      setNewPostDescription('');
      setNewPostImage(null);
      fetchCommunityPosts();
    } catch (error) {
      console.error(
        '❌ Post oluşturma hatası:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        `Failed to create post: ${
          error.response?.data?.message || error.message
        }`,
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.postContainer}>
              <View style={styles.postHeader}>
                <Image
                  source={{uri: item.user.image}}
                  style={styles.profileImage}
                />
                <Text style={styles.username}>
                  {item.user.firstName} {item.user.lastName}
                </Text>
              </View>
              {item.imageUrl && (
                <Image source={{uri: item.imageUrl}} style={styles.postImage} />
              )}
              <Text style={styles.postDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.createPostButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* ✅ MODERN MODAL EKLENDİ */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create Post</Text>
          <TextInput
            placeholder="Enter a description"
            style={styles.textInput}
            value={newPostDescription}
            onChangeText={setNewPostDescription}
            placeholderTextColor="#888"
          />
          {newPostImage && (
            <Image
              source={{uri: newPostImage.uri}}
              style={styles.previewImage}
            />
          )}
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={handlePickImage}>
            <Ionicons name="image-outline" size={20} color="white" />
            <Text style={styles.imagePickerButtonText}>
              {newPostImage ? 'Change Image' : 'Pick an Image'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, posting && {opacity: 0.7}]}
            onPress={handleCreatePost}
            disabled={posting}>
            {posting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  postContainer: {padding: 10, borderBottomWidth: 1, borderColor: '#ddd'},
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  username: {fontWeight: 'bold'},
  postImage: {width: '100%', height: 200, borderRadius: 10, marginVertical: 10},
  postDescription: {marginBottom: 10},
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
  },
  modal: {justifyContent: 'center', margin: 0},
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
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

export default PostScreen;
