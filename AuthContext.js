import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState, createContext} from 'react';
import {decode as atob} from 'base-64';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);

  const clearUserData = async () => {
    try {
      setAccessToken(null);
      setUserId(null);
      setUser(null);
      setRole('user');
      await AsyncStorage.multiRemove([
        'accessToken',
        'refreshToken',
        'userId',
        'role',
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const decodeToken = async (token, refreshToken) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedData = JSON.parse(atob(base64));

      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedData.exp < currentTime) {
        if (refreshToken) {
          await refreshAccessToken(refreshToken);
          return;
        }
        throw new Error('Token has expired');
      }

      setAccessToken(token);
      setUserId(decodedData.userId);
      setRole(decodedData.role);
    } catch (error) {
      console.error('Error decoding token:', error);
      await clearUserData();
    }
  };

  const refreshAccessToken = async refreshToken => {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token not found');
      }

      const response = await axios.post(
        'https://biletixai.onrender.com/refresh',
        {token: refreshToken},
        {timeout: 5000},
      );

      const {accessToken: newAccessToken} = response.data;
      if (!newAccessToken) {
        throw new Error('Failed to fetch new access token');
      }

      await AsyncStorage.setItem('accessToken', newAccessToken);
      await decodeToken(newAccessToken, refreshToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      await clearUserData();
    }
  };

  const isLoggedIn = async () => {
    try {
      const [storedAccessToken, storedRefreshToken] = await Promise.all([
        AsyncStorage.getItem('accessToken'),
        AsyncStorage.getItem('refreshToken'),
      ]);

      if (storedAccessToken) {
        await decodeToken(storedAccessToken, storedRefreshToken);
      } else if (storedRefreshToken) {
        await refreshAccessToken(storedRefreshToken);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      await clearUserData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newAccessToken, newRefreshToken) => {
    try {
      await AsyncStorage.setItem('accessToken', newAccessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      await decodeToken(newAccessToken, newRefreshToken);
    } catch (error) {
      console.error('Login error:', error);
      await clearUserData();
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isLoading,
        setAccessToken,
        userId,
        user,
        role,
        setRole,
        setUserId,
        clearUserData,
        login,
        isLoggedIn,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
