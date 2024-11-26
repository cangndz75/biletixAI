import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, createContext } from 'react';
import { decode as atob } from 'base-64';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        console.log('Stored Token:', storedToken);
        decodeToken(storedToken);
      }
    } catch (error) {
      console.log('Error fetching token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedData = JSON.parse(atob(base64));
      
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedData.exp < currentTime) {
        clearUserData();
        return;
      }
  
      setToken(token);
      setUserId(decodedData.userId);
      setRole(decodedData.role);
      fetchUserData(decodedData.userId);
    } catch (error) {
      console.error('Error decoding token:', error);
      clearUserData();
    }
  };
  

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const clearUserData = async () => {
    setToken(null);
    setUserId(null);
    setUser(null);
    setRole('user');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('role');
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        setToken,
        userId,
        user,
        role,
        setRole,
        setUserId,
        clearUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
