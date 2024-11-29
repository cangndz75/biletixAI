import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
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
      let userData = {};

      for (const screenName of screens) {
        const screenData = await getRegistrationProgress(screenName);
        if (screenData) {
          userData = {...userData, ...screenData};
        }
      }

      setUserData(userData);
    } catch (error) {
      console.log('Error fetching registration progress:', error);
    }
  };

  const clearAllScreenData = async () => {
    try {
      const screens = ['Register', 'Password', 'Name', 'Image'];

      for (const screenName of screens) {
        const key = `registration_progress_${screenName}`;
        await AsyncStorage.removeItem(key);
      }

      console.log('All screen data cleared!');
    } catch (error) {
      console.log('Error clearing screen data:', error);
    }
  };

  const registerUser = async () => {
    try {
      const response = await axios.post(
        'http://10.0.2.2:8000/register',
        userData,
      );

      if (response.data.accessToken) {
        const {accessToken, refreshToken, userId, role} = response.data;

        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('userId', String(userId));
        await AsyncStorage.setItem('role', role);

        setAccessToken(accessToken);
        setUserId(userId);
        setRole(role);

        clearAllScreenData();

        navigation.replace('InterestSelectionScreen');
      } else {
        throw new Error('Access token alınamadı');
      }
    } catch (error) {
      console.log(
        'Error during registration:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message ||
          'Something went wrong. Please try again later.',
      );
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{marginTop: 80}}>
        <Text style={styles.heading}>All set to register</Text>
        <Text style={styles.heading}>Setting up your profile for you</Text>
      </View>

      <Pressable onPress={registerUser} style={styles.button}>
        <Text style={styles.buttonText}>Finish Registering</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'GeezaPro-Bold',
    marginLeft: 20,
  },
  button: {
    backgroundColor: '#03C03C',
    padding: 15,
    marginTop: 'auto',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default PreFinalScreen;
