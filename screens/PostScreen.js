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

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const {user} = useContext(AuthContext);
  const route = useRoute();
  const {communityId} = route.params;

  useEffect(() => {
    fetchCommunityPosts();
  }, [communityId]);

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

    setPosting(true);
    const formData = new FormData();
    formData.append('description', newPostDescription);
    formData.append('userId', user._id);
    formData.append('community', communityId);

    if (newPostImage) {
      formData.append('image', {
        uri: newPostImage.uri,
        type: newPostImage.type,
        name: newPostImage.fileName || 'post.jpg',
      });
    }

    try {
      await axios.post('https://biletixai.onrender.com/posts/create', formData);
      setModalVisible(false);
      setNewPostDescription('');
      setNewPostImage(null);
      fetchCommunityPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Unable to create post.');
    } finally {
      setPosting(false);
    }
  };

  const renderPost = ({item}) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image source={{uri: item.user.image}} style={styles.profileImage} />
        <Text style={styles.username}>
          {item.user.firstName} {item.user.lastName}
        </Text>
      </View>
      {item.imageUrl && (
        <Image source={{uri: item.imageUrl}} style={styles.postImage} />
      )}
      <Text style={styles.postDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={{marginTop: 20}}
        />
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={50} color="#ccc" />
          <Text style={styles.emptyText}>No posts available</Text>
          <Text style={styles.emptySubText}>
            Be the first to share something in this community!
          </Text>
          <TouchableOpacity
            style={styles.emptyCreatePostButton}
            onPress={toggleModal}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.emptyCreatePostText}>Create a Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          renderItem={renderPost}
        />
      )}
      <TouchableOpacity style={styles.createPostButton} onPress={toggleModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODERN CREATE POST MODAL */}
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
  postHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  username: {fontWeight: 'bold'},
  postImage: {width: '100%', height: 200, borderRadius: 10, marginVertical: 10},
  postDescription: {marginBottom: 10},

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#555'},
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },

  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
  },

  modal: {justifyContent: 'center', margin: 0},
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 10,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {color: 'white', fontWeight: 'bold'},
});

export default PostScreen;
