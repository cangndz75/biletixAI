import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {setToken, setUserId, setRole} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://10.0.2.2:8000/login',
        { email, password }
      );
      const { token, userId, role } = response.data;
  
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userId', String(userId));
      await AsyncStorage.setItem('role', role);
  
      setToken(token);
      setUserId(userId);
      setRole(role);
  
      if (role === 'organizer') {
        navigation.navigate('AdminDashboard');
      } else {
        navigation.navigate('Drawer', { screen: 'Home' });
      }
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{flex: 1, justifyContent: 'center', padding: 20}}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 20,
            }}>
            Login
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginVertical: 10,
              borderRadius: 5,
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              marginVertical: 10,
              borderRadius: 5,
            }}
            secureTextEntry
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#007bff',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
              marginVertical: 10,
            }}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;