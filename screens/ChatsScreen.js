import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const ChatsScreen = () => {
  const [chats, setChats] = useState([]);
  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      getChats();
    }
  }, [userId]);

  const getChats = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/chats/${userId}`,
      );
      setChats(response.data);
    } catch (error) {
      console.log('Error fetching chats:', error);
    }
  };

  const renderChatItem = ({item}) => {
    if (!item.user) return null;

    return (
      <Pressable
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('ChatScreen', {userId: item.user._id})
        }>
        <Image
          source={{uri: item.user.image || 'https://via.placeholder.com/50'}}
          style={styles.userImage}
        />
        <View style={styles.chatDetails}>
          <Text style={styles.userName}>
            {item.user.firstName} {item.user.lastName}
          </Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Chats</Text>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={item => item.user._id}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No Chats yet</Text>
        )}
      />
    </SafeAreaView>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: 'gray',
    marginTop: 2,
  },
});
