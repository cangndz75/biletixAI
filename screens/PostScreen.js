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
import {useNavigation, useRoute} from '@react-navigation/native';
import Modal from 'react-native-modal';

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newPostDescription, setNewPostDescription] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  const {userId} = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const {communityId, communityName} = route.params;

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

  const handleLikePost = async postId => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/posts/${postId}/like`,
        {userId},
      );

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              }
            : post,
        ),
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost) return;

    try {
      await axios.post(
        `https://biletixai.onrender.com/posts/${selectedPost}/comment`,
        {
          userId,
          text: commentText,
        },
      );
      setCommentText('');
      fetchCommunityPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.title}>EventMate</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost', {communityId})}>
            <Ionicons name="add-circle-outline" size={28} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('LikeScreen', {communityId})}>
            <Ionicons name="heart-outline" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

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
                  source={{
                    uri: item.user.image || 'https://via.placeholder.com/150',
                  }}
                  style={styles.profileImage}
                />
                <View>
                  <Text style={styles.username}>
                    {item.user.firstName} {item.user.lastName}
                  </Text>
                  <Text style={styles.postDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Image
                source={{
                  uri: item.imageUrl || 'https://via.placeholder.com/400',
                }}
                style={styles.postImage}
              />
              <Text style={styles.postDescription}>{item.description}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity onPress={() => handleLikePost(item._id)}>
                  <Ionicons
                    name={item.isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.isLiked ? 'red' : '#000'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedPost(item._id)}>
                  <Ionicons name="chatbubble-outline" size={22} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {selectedPost && (
        <View style={styles.commentBox}>
          <TextInput
            placeholder="Yorum yaz..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.commentInput}
          />
          <TouchableOpacity onPress={handleAddComment}>
            <Ionicons name="send" size={24} color="#007BFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
  },
  title: {fontSize: 22, fontWeight: 'bold', color: '#007BFF'},
  headerIcons: {flexDirection: 'row', gap: 15},
  postContainer: {padding: 15, borderBottomWidth: 1, borderColor: '#ddd'},
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  username: {fontWeight: 'bold'},
  postDate: {color: '#888', fontSize: 12},
  postImage: {width: '100%', height: 200, borderRadius: 10, marginVertical: 10},
  postDescription: {marginBottom: 10},
  postActions: {flexDirection: 'row', gap: 15},
  commentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
});

export default PostScreen;
