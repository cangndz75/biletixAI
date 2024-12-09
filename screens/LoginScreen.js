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
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('https://biletixai.onrender.com/login', {
        email,
        password,
      });

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
          color: '#dc3545',
        }}>
        Login
      </Text>
      <View style={{marginBottom: 20}}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10,
          }}
          autoCapitalize="none"
        />
        <View
          style={{
            position: 'relative',
          }}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              padding: 10,
              borderRadius: 5,
            }}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
            }}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#ccc"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#dc3545',
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
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={{marginTop: 20, alignItems: 'center'}}>
        <Text style={{color: '#007bff', fontSize: 14}}>Get Started</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={{marginTop: 10, alignItems: 'center'}}>
        <Text style={{color: '#007bff', fontSize: 14}}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
