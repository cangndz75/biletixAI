import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../AuthContext';

const API_BASE_URL = 'https://biletixai.onrender.com';
const {width} = Dimensions.get('window');

const EventsForLocation = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const {userId} = useContext(AuthContext);
  const route = useRoute();
  const navigation = useNavigation();
  const {city, district} = route.params;
  const [sortType, setSortType] = useState('Most Relevant');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        if (response.status === 200) {
          const filteredEvents = response.data.filter(event =>
            event.location.includes(district),
          );
          setEvents(filteredEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [district]);

  const sortedEvents = [...events].sort((a, b) => {
    if (sortType === 'Most Recent') {
      return new Date(b.date) - new Date(a.date);
    }
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {district}, {city} Events
        </Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.resultText}>{events.length} Results</Text>
        <TouchableOpacity
          onPress={() =>
            setSortType(
              sortType === 'Most Relevant' ? 'Most Recent' : 'Most Relevant',
            )
          }>
          <Text style={styles.sortText}>{sortType} ⌄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={styles.loadingIndicator}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventsText}>
          No events found for {district}, {city}.
        </Text>
      ) : (
        <FlatList
          data={sortedEvents}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => navigation.navigate('EventSetUp', {item})}>
              <Image
                source={{
                  uri: item.images?.[0] || 'https://via.placeholder.com/300',
                }}
                style={styles.eventImage}
              />

              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.eventDate}>
                  {new Date(item.date).toDateString()}
                </Text>

                <View style={styles.attendanceRow}>
                  <Ionicons name="people-outline" size={16} color="#888" />
                  <Text style={styles.attendanceText}>
                    {item.attendees?.length || 0} People Will Attend
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8F2',
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#265C3D',
  },
  sortText: {
    fontSize: 14,
    color: '#2E856E',
    fontWeight: '600',
  },
  loadingIndicator: {
    marginTop: 50,
    alignSelf: 'center',
  },
  noEventsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    overflow: 'hidden',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default EventsForLocation;
