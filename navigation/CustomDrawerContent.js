import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {AuthContext} from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity} from 'react-native-gesture-handler';

const API_BASE_URL = 'https://biletixai.onrender.com';

function CustomDrawerContent(props) {
  const {userId} = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
        if (response.status === 200) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
      });
    } catch (error) {
      console.error('Error during logout:', error.message);
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        <Image
          source={{uri: user?.image || 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>
          {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
        </Text>
        <Text style={styles.userScore}>{user?.vipBadge ? 'VIP ⭐ ' : ''}</Text>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home-outline" size={22} color="white" />
        <Text style={styles.menuText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Community')}>
        <Ionicons name="people-outline" size={22} color="white" />
        <Text style={styles.menuText}>Community</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('BecomeOrganizerScreen')}>
        <Ionicons name="grid-outline" size={22} color="white" />
        <Text style={styles.menuText}>Be Organizer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('EventScreen')}>
        <Ionicons name="earth-outline" size={22} color="white" />
        <Text style={styles.menuText}>Events</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.navigate('Profile', {userId})}>
        <Ionicons name="people-circle-outline" size={22} color="white" />
        <Text style={styles.menuText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="white" />
        <Text style={styles.menuText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}>
        <Ionicons name="arrow-back" size={22} color="white" />
        <Text style={[styles.menuText, {color: 'white'}]}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#02754E',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userScore: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
});
