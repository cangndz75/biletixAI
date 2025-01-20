import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';

const PostScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const {userId} = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
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

  const handleLikePost = async postId => {
    try {
      await axios.post(`https://biletixai.onrender.com/posts/${postId}/like`, {
        userId,
      });
      fetchCommunityPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EventMate</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('LikeScreen')}>
            <Ionicons name="heart-outline" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePost', {communityId})}>
            <Ionicons name="add-circle-outline" size={28} color="#000" />
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
              {item.imageUrl && (
                <Image source={{uri: item.imageUrl}} style={styles.postImage} />
              )}
              <Text style={styles.postDescription}>{item.description}</Text>

              <View style={styles.postActions}>
                <TouchableOpacity onPress={() => handleLikePost(item._id)}>
                  <Ionicons name="heart-outline" size={22} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('CommentScreen', {postId: item._id})
                  }>
                  <Ionicons name="chatbubble-outline" size={22} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
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
});

export default PostScreen;
