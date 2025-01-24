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
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
      }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{position: 'absolute', top: 50, left: 20}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: '#222',
          marginBottom: 5,
        }}>
        Hey,
      </Text>
      <Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: '#222',
          marginBottom: 20,
        }}>
        Welcome Back
      </Text>
      <Text style={{fontSize: 16, color: '#555', marginBottom: 30}}>
        Please login to continue
      </Text>

      <View style={{marginBottom: 15}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            borderRadius: 10,
            marginBottom: 10,
          }}>
          <Ionicons name="mail-outline" size={20} color="#888" />
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            style={{flex: 1, marginLeft: 10, fontSize: 16}}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            borderRadius: 10,
            position: 'relative',
          }}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" />
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            style={{flex: 1, marginLeft: 10, fontSize: 16}}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={{position: 'absolute', right: 15}}>
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* <TouchableOpacity
        onPress={() => navigation.navigate('ForgotPassword')}
        style={{alignSelf: 'flex-end', marginBottom: 30}}>
        <Text style={{color: '#555', fontSize: 14}}>Forgot Password?</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#00B060',
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 20,
        }}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>
            Login
          </Text>
        )}
      </TouchableOpacity>

      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize: 14, color: '#555'}}>
          Don't have an account?{' '}
          <Text
            onPress={() => navigation.navigate('Register')}
            style={{color: '#00B060', fontWeight: 'bold'}}>
            Sign up
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
