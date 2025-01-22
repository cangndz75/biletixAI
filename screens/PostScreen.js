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
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const {userId} = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const {communityId} = route.params;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCommunityPosts();
      fetchUserLikedPosts();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCommunityPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/communities/${communityId}/posts`,
      );
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLikedPosts = async () => {
    const userResponse = await axios.get(
      `https://biletixai.onrender.com/users/${userId}`,
    );

    const userLikedPosts = new Set(
      userResponse.data.likedPosts.map(id => id.toString()),
    );
    setLikedPosts(userLikedPosts);
  };

  const handleLikePost = async postId => {
    try {
      const isCurrentlyLiked = likedPosts.has(postId);

      setLikedPosts(prev => {
        const updated = new Set(prev);
        if (isCurrentlyLiked) {
          updated.delete(postId);
        } else {
          updated.add(postId);
        }
        return updated;
      });

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: isCurrentlyLiked
                  ? post.likes.filter(id => id !== userId)
                  : [...post.likes, userId],
              }
            : post,
        ),
      );

      await axios.post(`https://biletixai.onrender.com/posts/${postId}/like`, {
        userId,
      });
    } catch (error) {
      console.error('❌ Error liking post:', error);
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
          renderItem={({item}) => {
            const isLiked = likedPosts.has(item._id);
            return (
              <View style={styles.postContainer}>
                <View style={styles.postHeader}>
                  <Image
                    source={{
                      uri:
                        item.user?.image || 'https://via.placeholder.com/150',
                    }}
                    style={styles.profileImage}
                  />
                  <View>
                    <Text style={styles.username}>
                      {item.user?.firstName} {item.user?.lastName}
                    </Text>
                    <Text style={styles.postDate}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {item.imageUrl && (
                  <Image
                    source={{uri: item.imageUrl}}
                    style={styles.postImage}
                  />
                )}
                <Text style={styles.postDescription}>{item.description}</Text>

                <View style={styles.postActions}>
                  <TouchableOpacity
                    onPress={() => handleLikePost(item._id)}
                    style={styles.actionButton}>
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isLiked ? 'red' : '#000'}
                    />
                    <Text style={styles.actionText}>{item.likes.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('CommentScreen', {postId: item._id})
                    }
                    style={styles.actionButton}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={22}
                      color="#000"
                    />
                    <Text style={styles.actionText}>
                      {item.comments.length}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts available</Text>
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

  postContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  username: {fontWeight: 'bold', fontSize: 16},
  postDate: {color: '#888', fontSize: 12},

  postImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginVertical: 10,
  },
  postDescription: {fontSize: 14, marginBottom: 10},

  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {fontSize: 14, color: '#000'},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default PostScreen;
