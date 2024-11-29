import React, {useEffect, useContext, useState} from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {getRegistrationProgress} from '../registrationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const PreFinalScreen = () => {
  const {setAccessToken, setUserId, setRole} = useContext(AuthContext);
  const [userData, setUserData] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    getAllUserData();
  }, []);

  const getAllUserData = async () => {
    try {
      const screens = ['Register', 'Password', 'Name', 'Image'];
      let accumulatedData = {};

      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          accumulatedData = {...accumulatedData, ...screenData};
        }
      }

      setUserData(accumulatedData);
    } catch (error) {
      console.log('Error fetching registration progress:', error);
      Alert.alert(
        'Error',
        'Failed to load your registration data. Please try again.',
      );
    }
  };

  const clearAllScreenData = async () => {
    try {
      const screens = ['Register', 'Password', 'Name', 'Image'];

      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }

      console.log('All screen data cleared successfully!');
    } catch (error) {
      console.log('Error clearing screen data:', error);
    }
  };

  const registerUser = async () => {
    try {
      if (Object.keys(userData).length === 0) {
        Alert.alert('Error', 'Registration data is missing. Please try again.');
        return;
      }

      const response = await axios.post(
        'https://biletixai.onrender.com/register', 
        userData,
      );

      const {accessToken, refreshToken, userId, role} = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error('Invalid token received during registration.');
      }

      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['userId', String(userId)],
        ['role', role],
      ]);

      setAccessToken(accessToken);
      setUserId(userId);
      setRole(role);

      clearAllScreenData();

      navigation.replace('InterestSelectionScreen');
    } catch (error) {
      console.error('Error during registration:', error);
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message ||
          'An error occurred during registration. Please try again later.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>All set to register</Text>
        <Text style={styles.subHeading}>
          Setting up your profile for you...
        </Text>
      </View>

      <Pressable onPress={registerUser} style={styles.button}>
        <Text style={styles.buttonText}>Finish Registering</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  content: {
    marginTop: 80,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#03C03C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PreFinalScreen;
