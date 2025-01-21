import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {useContext} from 'react';
import {AuthContext} from '../../AuthContext';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const {logout} = useContext(AuthContext);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    {title: 'Settings', icon: 'settings-outline', route: 'Settings'},
  ];

  useEffect(() => {
    const loadThemePreference = async () => {
      const savedMode = await AsyncStorage.getItem('theme');
      setDarkMode(savedMode === 'dark');
    };
    loadThemePreference();
  }, []);

  useEffect(() => {
    fetchRecentParticipants();
  }, []);

  const fetchRecentParticipants = async () => {
    try {
      const response = await axios.get('https://biletixai.onrender.com/events');
      const events = response.data || [];

      let participants = [];
      events.forEach(event => {
        if (event.attendees) {
          participants = [...participants, ...event.attendees];
        }
      });

      setRecentParticipants(participants.slice(0, 6));
      setEventsCount(events.length);
    } catch (error) {
      console.error('Error fetching recent participants:', error);
      setError('❌ Veriler alınırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity onPress={toggleTheme}>
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Total Events</Text>
          <Text style={styles.cardText}>{eventsCount} Events</Text>
        </View>

        {/* <Text style={styles.recentTitle}>Recent Participants</Text>
        <FlatList
          horizontal
          data={recentParticipants}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.participant}>
              <Image
                source={{uri: item.image || 'https://via.placeholder.com/100'}}
                style={styles.participantImage}
              />
              <Text style={styles.participantName}>
                {item.name || 'Unknown'}
              </Text>
            </View>
          )}
        /> */}

        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => navigation.navigate('OrganizerSubscribe')}>
          <Ionicons name="star" size={24} color="white" />
          <Text style={styles.premiumButtonText}>
            Become a Premium Organizer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    card: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 15,
      marginBottom: 20,
      alignItems: 'center',
    },
    cardTitle: {fontSize: 18, fontWeight: 'bold'},
    cardText: {fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 5},
    recentTitle: {
      color: darkMode ? '#FFF' : '#333',
      fontSize: 18,
      marginBottom: 8,
    },
    participant: {alignItems: 'center', marginRight: 12},
    participantImage: {width: 60, height: 60, borderRadius: 30},
    participantName: {
      color: darkMode ? '#FFF' : '#333',
      marginTop: 6,
      fontSize: 12,
    },
    premiumButton: {
      flexDirection: 'row',
      backgroundColor: '#FFD700',
      padding: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
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
    premiumButtonText: {
      color: '#FFF',
      marginLeft: 8,
      fontSize: 16,
      fontWeight: 'bold',
    },
    logoutButtonText: {
      color: '#FFF',
      marginLeft: 8,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default AdminDashboard;
