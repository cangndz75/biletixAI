import AsyncStorage from '@react-native-async-storage/async-storage';
import {createContext, useState, useEffect} from 'react';

const AuthContext = createContext();

const AuthProvider = ({children}) => {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('user');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveUserData = async (userId, role, user) => {
    try {
      setUserId(userId);
      setRole(role);
      setUser(user);

      await AsyncStorage.multiSet([
        ['userId', userId],
        ['role', role],
        ['user', JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedRole = await AsyncStorage.getItem('role');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedUserId && storedRole && storedUser) {
        setUserId(storedUserId);
        setRole(storedRole);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearUserData = async () => {
    try {
      setUserId(null);
      setRole('user');
      setUser(null);
      await AsyncStorage.multiRemove(['userId', 'role', 'user']);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const login = async (userId, role, user) => {
    await saveUserData(userId, role, user);
  };

  const logout = async () => {
    await clearUserData();
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userId,
        role,
        user,
        isLoading,
        login,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
