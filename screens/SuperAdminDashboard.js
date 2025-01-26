import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Animated from 'react-native-reanimated';

const API_BASE_URL = 'https://biletixai.onrender.com';

const SuperAdminDashboard = ({navigation}) => {
  const {userId} = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalEvents: 0,
    totalOrganizers: 0,
    pendingApprovals: 0,
    staffMembers: 0,
  });
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchDashboardStats();
    fetchVenues();
  }, []);

  const fetchUserInfo = async () => {
    try {
      if (!userId) return;
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user info:', error.message);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [eventsRes, organizersRes, pendingRes, staffRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/events/count`),
          axios.get(`${API_BASE_URL}/users/count?role=organizer`),
          axios.get(`${API_BASE_URL}/users/count?status=pending`),
          axios.get(`${API_BASE_URL}/users/count?role=staff`),
        ]);

      setDashboardStats({
        totalEvents: eventsRes.data.count || 0,
        totalOrganizers: organizersRes.data.count || 0,
        pendingApprovals: pendingRes.data.count || 0,
        staffMembers: staffRes.data.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/venues`);
      setVenues(response.data || []);
    } catch (error) {
      console.error('Error fetching venues:', error.message);
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#333" />
        <Text>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Image
            source={{uri: user?.image || 'https://via.placeholder.com/50'}}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.greeting}>
              Hello,{' '}
              <Text style={styles.username}>
                {user?.firstName} {user?.lastName}
              </Text>
            </Text>
            <Text style={styles.location}>Istanbul, Turkey</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Search events, users..."
          style={styles.searchInput}
        />
      </View>

      <View style={styles.cardContainer}>
        {[
          {
            title: 'Total Events',
            value: dashboardStats.totalEvents,
            icon: 'calendar-outline',
            color: '#FFCC80',
          },
          {
            title: 'Total Organizers',
            value: dashboardStats.totalOrganizers,
            icon: 'people-outline',
            color: '#A5D6A7',
          },
          {
            title: 'Pending Approvals',
            value: dashboardStats.pendingApprovals,
            icon: 'hourglass-outline',
            color: '#EF9A9A',
          },
          {
            title: 'Staff Members',
            value: dashboardStats.staffMembers,
            icon: 'person-outline',
            color: '#90CAF9',
          },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.card, {backgroundColor: item.color}]}>
            <Ionicons name={item.icon} size={28} color="#333" />
            <Text style={styles.cardValue}>{item.value}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Venues</Text>

      <View style={styles.venueSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={venues}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <Animated.View style={styles.venueCard}>
              <Image
                source={{uri: item.image || 'https://via.placeholder.com/80'}}
                style={styles.venueImage}
              />
              <View style={styles.venueDetails}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueType}>
                  {truncateText(item.location, 30)}
                </Text>
              </View>
            </Animated.View>
          )}
        />
        <TouchableOpacity
          style={styles.newVenueButton}
          onPress={() => navigation.navigate('AdminCreateVenue')}>
          <Text style={styles.newVenueText}>Add a New</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAFAFA', padding: 20},
  loaderContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileSection: {flexDirection: 'row', alignItems: 'center'},
  profileImage: {width: 50, height: 50, borderRadius: 25, marginRight: 12},
  greeting: {fontSize: 16, color: '#666'},
  username: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  location: {fontSize: 14, color: '#888'},
  headerIcons: {flexDirection: 'row', gap: 15},
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {marginLeft: 10, fontSize: 16, flex: 1},
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  venueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  venueCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    alignItems: 'center',
  },
  venueImage: {width: 80, height: 80, borderRadius: 10, marginBottom: 10},
  venueDetails: {alignItems: 'center'},
  newVenueButton: {
    backgroundColor: '#333',
    width: 35,
    height: 140,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    right: 10,
  },
  newVenueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    transform: [{rotate: '90deg'}],
    textAlign: 'center',
  },
});

export default SuperAdminDashboard;
