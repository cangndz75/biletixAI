import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ImageViewing from 'react-native-image-viewing';
import {TextInput} from 'react-native';
import {Switch} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';

const ProfileDetailScreen = () => {
  const [user, setUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const {userId, logout} = useContext(AuthContext);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchUser = async () => {
    try {
      if (!userId) throw new Error('User ID is undefined');
      const response = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
      );
      setUser(response.data);
      setIsPrivate(response.data.isPrivate);
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      Alert.alert('Error', 'Failed to fetch user data.');
    }
  };

  useEffect(() => {
    if (isFocused && userId) {
      fetchUser();
    }
  }, [isFocused, userId]);

  const handlePrivacyToggle = async () => {
    try {
      const newPrivacyStatus = !isPrivate;
      await axios.put(`https://biletixai.onrender.com/user/${userId}/privacy`, {
        isPrivate: newPrivacyStatus,
      });
      setIsPrivate(newPrivacyStatus);
      setUser(prevState => ({
        ...prevState,
        isPrivate: newPrivacyStatus,
      }));
    } catch (error) {
      console.error('Error updating privacy:', error.message);
      Alert.alert('Error', 'Failed to update privacy setting.');
    }
  };

  const handleSubscribe = () => {
    navigation.navigate('UserSubscribe', {userId});
  };

  const clearAuthToken = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error during logout:', error.message);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const updateAboutMe = async () => {
    try {
      const url = `https://biletixai.onrender.com/user/${userId}/about`;
      await axios.put(url, {aboutMe: aboutText});
      setUser(prevState => ({
        ...prevState,
        aboutMe: aboutText,
      }));
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to update about me:', error.message);
      Alert.alert('Error', 'Failed to update About Me section.');
    }
  };

  const handleOpenModal = () => {
    setAboutText(user?.aboutMe || '');
    setIsModalVisible(true);
  };

  const images = [{uri: user?.image || 'https://via.placeholder.com/150'}];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 20}}>
        <View style={styles.header}>
          <Pressable onPress={() => setVisible(true)}>
            <Image
              style={styles.profileImage}
              source={{uri: user?.image || 'https://via.placeholder.com/150'}}
            />
          </Pressable>
          <Text style={styles.userName}>{user?.firstName || 'User Name'}</Text>
          <View style={styles.followContainer}>
            <Text style={styles.followText}>
              {user?.followers?.length || 0} Followers
            </Text>
            <Text style={styles.followText}>|</Text>
            <Text style={styles.followText}>
              {user?.following?.length || 0} Following
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>Subscribe to User Plus</Text>
        </TouchableOpacity>
        <View style={styles.aboutMeContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.aboutMeTitle}>About Me</Text>
            <TouchableOpacity onPress={handleOpenModal}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.aboutMeDescription}>
            {user?.aboutMe || 'Share something about yourself!'}
          </Text>
        </View>

        <View style={styles.interestsContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.interestsTitle}>Interests</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('InterestSelectionScreen')}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {user?.interests?.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>Make the account private</Text>
          <Switch
            value={isPrivate}
            onValueChange={handlePrivacyToggle}
            color="#007bff"
            style={styles.switchStyle}
          />
        </View>

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => navigation.navigate('MyBookings', {userId})}>
          <View style={styles.iconContainer}>
            <AntDesign name="calendar" size={24} color="green" />
          </View>
          <Text style={styles.optionText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={() => navigation.navigate('Faqs', {userId})}>
          <View style={styles.iconContainer}>
            <AntDesign name="calendar" size={24} color="green" />
          </View>
          <Text style={styles.optionText}>FAQs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionContainer}
          onPress={clearAuthToken}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={24} color="red" />
          </View>
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>

        <ImageViewing
          images={images}
          imageIndex={0}
          visible={visible}
          onRequestClose={() => setVisible(false)}
        />
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit About Me</Text>
            <TextInput
              value={aboutText}
              onChangeText={setAboutText}
              style={styles.textInput}
              multiline
            />
            <TouchableOpacity onPress={updateAboutMe} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProfileDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
  },
  followContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  followText: {
    fontSize: 16,
    color: 'gray',
    marginHorizontal: 8,
  },
  aboutMeContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  aboutMeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  aboutMeDescription: {
    fontSize: 16,
    color: 'gray',
    lineHeight: 22,
  },
  interestsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  interestsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0f7fa',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  privacyText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  switchStyle: {
    transform: [{scale: 1.2}],
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
    color: '#333',
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'black',
    fontWeight: '600',
    fontSize: 16,
  },
  subscribeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  subscribeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
