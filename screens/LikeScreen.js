import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const LikeScreen = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const fetchLikedPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/users/${userId}/liked-posts`,
      );
      setLikedPosts(response.data.likedPosts || []);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Beğendiğin Gönderiler</Text>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={likedPosts}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.postContainer}>
              <Image
                source={{
                  uri: item.imageUrl || 'https://via.placeholder.com/400',
                }}
                style={styles.postImage}
              />
              <Text style={styles.postDescription}>{item.description}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 15},
  header: {fontSize: 22, fontWeight: 'bold', marginBottom: 10},
  postContainer: {padding: 15, borderBottomWidth: 1, borderColor: '#ddd'},
  postImage: {width: '100%', height: 200, borderRadius: 10, marginBottom: 10},
  postDescription: {fontSize: 16},
});

export default LikeScreen;
