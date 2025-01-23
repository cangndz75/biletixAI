import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';

const CommentScreen = () => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);
  const route = useRoute();
  const {postId} = route.params;

  useEffect(() => {
    console.log('Yüklenen Post ID:', postId);
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/posts/${postId}/comments`,
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      await axios.post(
        `https://biletixai.onrender.com/posts/${postId}/comment`,
        {userId, text: commentText},
      );
      setCommentText('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Comments</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View style={styles.commentItem}>
              <Image
                source={{
                  uri: item.user.image || 'https://via.placeholder.com/150',
                }}
                style={styles.commentProfileImage}
              />
              <View>
                <Text style={styles.commentUsername}>
                  {item.user.firstName} {item.user.lastName}
                </Text>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.commentBox}>
        <TextInput
          placeholder="Write a comment..."
          value={commentText}
          onChangeText={setCommentText}
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment}>
          <Ionicons name="send" size={24} color="#007BFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 10},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentUsername: {fontWeight: 'bold'},
  commentText: {fontSize: 14, color: '#333'},
  commentBox: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
});

export default CommentScreen;
