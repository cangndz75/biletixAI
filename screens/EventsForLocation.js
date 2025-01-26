import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_BASE_URL = 'https://biletixai.onrender.com';

const EventsForLocation = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const navigation = useNavigation();

  const {city, district} = route.params;

  useEffect(() => {
    const fetchVenuesForLocation = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/venues/location?city=${city}&district=${district}`,
        );
        if (response.status === 200) {
          setVenues(response.data);
        }
      } catch (error) {
        console.error('Error fetching venues:', error);
      }
    };

    fetchVenuesForLocation();
  }, [city, district]);

  useEffect(() => {
    if (venues.length === 0) return;

    const fetchEventsForVenue = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        if (response.status === 200) {
          const venueNames = venues.map(venue => venue.name);
          const filteredEvents = response.data.filter(event =>
            venueNames.includes(event.location),
          );
          setEvents(filteredEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsForVenue();
  }, [venues]);

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

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{marginTop: 20}}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventsText}>
          No events found for {district}, {city}.
        </Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => {
                if (!item._id) {
                  console.error('Event ID is missing:', item);
                  return;
                }
                navigation.navigate('EventSetUp', {eventId: item._id});
              }}>
              <Image
                source={{
                  uri: item.images?.[0] || 'https://via.placeholder.com/150',
                }}
                style={styles.eventImage}
              />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.date}</Text>
                <Text style={styles.eventLocation}>{item.location}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 10},
  header: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  backButton: {marginRight: 10},
  headerTitle: {fontSize: 20, fontWeight: 'bold'},
  noEventsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    elevation: 2,
  },
  eventImage: {width: 80, height: 80, borderRadius: 10, marginRight: 10},
  eventInfo: {flex: 1},
  eventTitle: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  eventDate: {fontSize: 14, color: '#777'},
  eventLocation: {fontSize: 14, color: '#555'},
});

export default EventsForLocation;
