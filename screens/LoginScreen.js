import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://biletixai.onrender.com/login',
        {
          email,
          password,
        },
      );

      const {userId, role, user} = response.data;

      if (!userId || !role) {
        throw new Error('Invalid login response. Missing userId or role.');
      }

      await login(userId, role, user);
      navigation.reset({
        index: 0,
        routes: [{name: 'BottomTabs'}],
      });
    } catch (error) {
      console.error('Login failed:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};

export default LoginScreen;
