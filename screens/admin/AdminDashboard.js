import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const {logout, userId} = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetchUserDetails();
    loadThemePreference();
  }, []);

  const fetchUserDetails = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
      );
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadThemePreference = async () => {
    const savedMode = await AsyncStorage.getItem('theme');
    setDarkMode(savedMode === 'dark');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    }
  };

  const styles = getStyles(darkMode);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{marginTop: 10}}>Veriler Yükleniyor...</Text>
      </View>
    );
  }

  const dashboardItems = [
    {title: 'Create Event', icon: 'add-circle-outline', route: 'AdminCreate'},
    {title: 'My Events', icon: 'calendar-outline', route: 'AdminEvents'},
    {title: 'Attends', icon: 'people-outline', route: 'Attends'},
    {
      title: 'Communities',
      icon: 'people-outline',
      route: 'AdminCommunityScreen',
    },
    {
      title: 'Create Community',
      icon: 'people-outline',
      route: 'AdminCreateCommunity',
    },
    {title: 'Venue', icon: 'business-outline', route: 'AdminCreateVenue'},
  ];

  if (user?.role === 'organizer' && user?.vipBadge) {
    dashboardItems.push({
      title: 'Add Advertisement',
      icon: 'megaphone-outline',
      route: 'AdminAdScreen',
    });
  }

  if (user?.role === 'organizer') {
    dashboardItems.push({
      title: 'Organizer Stats',
      icon: 'stats-chart-outline',
      route: 'OrganizerStats',
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity onPress={loadThemePreference}>
            <Ionicons
              name={darkMode ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color={darkMode ? '#FFD700' : '#555'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dashboardItem}
              onPress={() => navigation.navigate(item.route)}>
              <Ionicons name={item.icon} size={32} color="#FFF" />
              <Text style={styles.dashboardItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const getStyles = darkMode =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: darkMode ? '#1a1a1a' : '#f8f8f8'},
    scrollView: {padding: 16},
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: darkMode ? '#FFF' : '#333',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    dashboardItem: {
      backgroundColor: '#6A5ACD',
      padding: 20,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      width: '48%',
      marginBottom: 10,
    },
    dashboardItemText: {
      color: '#FFF',
      marginTop: 8,
      textAlign: 'center',
      fontSize: 14,
    },
    logoutButton: {
      flexDirection: 'row',
      backgroundColor: '#FF4444',
      padding: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 10,
    },
    logoutButtonText: {
      color: '#FFF',
      marginLeft: 8,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default AdminDashboard;
