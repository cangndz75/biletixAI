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
          <Ionicons name="arrow-back" size={24} color="black" />
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

  const sendMessage = async (senderId, receiverId) => {
    try {
      await axios.post('https://biletixai.onrender.com/sendMessage', {
        senderId,
        receiverId,
        message,
      });
      socket.emit('sendMessage', {senderId, receiverId, message});
      setMessage('');
      fetchMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const senderId = userId;
      const receiverId = route?.params?.receiverId;
      const response = await axios.get(
        'https://biletixai.onrender.com/messages',
        {
          params: {senderId, receiverId},
        },
      );
      setMessages(response.data);
    } catch (error) {
      console.error(error);
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
        {messages.map((item, index) => (
          <Pressable
            key={index}
            style={[
              item?.senderId?._id === userId
                ? {
                    alignSelf: 'flex-end',
                    backgroundColor: '#DCF8C6',
                    padding: 8,
                    maxWidth: '60%',
                    borderRadius: 7,
                    margin: 10,
                  }
                : {
                    alignSelf: 'flex-start',
                    backgroundColor: 'white',
                    padding: 8,
                    margin: 10,
                    borderRadius: 7,
                    maxWidth: '60%',
                  },
            ]}>
            <Text style={{fontSize: 13, textAlign: 'left'}}>
              {item?.message}
            </Text>
            <Text
              style={{
                textAlign: 'right',
                fontSize: 9,
                color: 'gray',
                marginTop: 4,
              }}>
              {formatTime(item?.timeStamp)}
            </Text>
            {item?.senderId?._id === userId && (
              <Pressable
                onPress={() => deleteMessage(item?._id)}
                style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                }}>
                <AntDesign name="delete" size={16} color="red" />
              </Pressable>
            )}
          </Pressable>
        ))}
      </ScrollView>
      <View
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#dddddd',
          marginBottom: 20,
        }}>
        <Entypo name="emoji-happy" size={24} color="gray" />
        <TextInput
          placeholder="type your message..."
          value={message}
          onChangeText={setMessage}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: '#ddddd',
            borderRadius: 20,
            paddingHorizontal: 10,
            marginLeft: 10,
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginHorizontal: 8,
          }}>
          <Entypo name="camera" size={24} color="gray" />
          <Feather name="mic" size={24} color="gray" />
        </View>
        <Pressable
          onPress={() => sendMessage(userId, route?.params?.receiverId)}
          style={{
            backgroundColor: '#0066b2',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}>
          <Text style={{textAlign: 'center', color: 'white'}}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatRoom;

const styles = StyleSheet.create({});
