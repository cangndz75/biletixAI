import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {AuthContext} from '../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import axios from 'axios';
import {useSocketContext} from '../SocketContext';

const ChatRoom = () => {
  const navigation = useNavigation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const {userId} = useContext(AuthContext);
  const {socket} = useSocketContext();
  const route = useRoute();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            onPress={() => navigation.goBack()}
          />
          <View>
            <Text>{route?.params?.name}</Text>
          </View>
        </View>
      ),
    });
  }, [navigation, route?.params?.name]);

  useEffect(() => {
    if (!socket) return;
    socket.on('newMessage', newMessage => {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    });
    return () => socket.off('newMessage');
  }, [socket]);

  const sendMessage = async () => {
    const receiverId = route?.params?.receiverId;

    if (!receiverId) {
      console.error('HATA: Receiver ID bulunamadı!');
      return;
    }

    try {
      console.log('Gönderilen Mesaj:', {
        senderId: userId,
        receiverId,
        message,
      });

      await axios.post('https://biletixai.onrender.com/sendMessage', {
        senderId: userId,
        receiverId,
        message,
      });

      socket.emit('sendMessage', {
        senderId: userId,
        receiverId,
        message,
      });

      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Mesaj Gönderme Hatası:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for:', {
        senderId: userId,
        receiverId: route?.params?.receiverId,
      });

      const response = await axios.get(
        'https://biletixai.onrender.com/messages',
        {
          params: {senderId: userId, receiverId: route?.params?.receiverId},
        },
      );

      console.log('Messages received:', response.data);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const deleteMessage = async messageId => {
    try {
      await axios.delete(
        `https://biletixai.onrender.com/messages/${messageId}`,
      );
      setMessages(messages.filter(item => item._id !== messageId));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatTime = time => {
    const options = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString('en-US', options);
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView>
        {messages.map((item, index) => {
          // senderId'nin doğrudan ObjectId veya nesne olma durumuna göre kontrol
          const isMyMessage = item.senderId?._id
            ? item.senderId._id === userId
            : item.senderId === userId;

          return (
            <Pressable
              key={index}
              style={[isMyMessage ? styles.myMessage : styles.receivedMessage]}>
              <Text style={styles.messageText}>{item?.message}</Text>
              <Text style={styles.timeText}>{formatTime(item?.timeStamp)}</Text>
              {isMyMessage && (
                <Pressable
                  onPress={() => deleteMessage(item?._id)}
                  style={styles.deleteIcon}>
                  <AntDesign name="delete" size={16} color="red" />
                </Pressable>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.inputContainer}>
        <Entypo name="emoji-happy" size={24} color="gray" />
        <TextInput
          placeholder="Type your message..."
          value={message}
          onChangeText={setMessage}
          style={styles.textInput}
        />
        <View style={styles.iconContainer}>
          <Entypo name="camera" size={24} color="gray" />
          <Feather name="mic" size={24} color="gray" />
        </View>
        <Pressable onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send2</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: 8,
    maxWidth: '60%',
    borderRadius: 7,
    margin: 10,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    padding: 8,
    maxWidth: '60%',
    borderRadius: 7,
    margin: 10,
  },
  messageText: {
    fontSize: 13,
    textAlign: 'left',
  },
  timeText: {
    textAlign: 'right',
    fontSize: 9,
    color: 'gray',
    marginTop: 4,
  },
  deleteIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: '#0066b2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonText: {
    textAlign: 'center',
    color: 'white',
  },
});
