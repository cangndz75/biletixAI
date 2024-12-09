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
      const safeUser = user ? JSON.stringify(user) : JSON.stringify({});
      await AsyncStorage.multiSet([
        ['userId', String(userId)],
        ['role', String(role)],
        ['user', safeUser],
      ]);
      setUserId(userId);
      setRole(role);
      setUser(user || {});
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
      await AsyncStorage.multiRemove(['userId', 'role', 'user']);
      setUserId(null);
      setRole('user');
      setUser(null);
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
