import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Animated from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MyBookings = () => {
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    console.log('📌 Kullanıcı ID (AuthContext):', userId);
  }, [userId]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#000" />
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        {['Upcoming', 'Completed', 'Cancelled'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={[styles.tabButton, selectedTab === tab && styles.activeTab]}>
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.activeTabText,
              ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <EventList filterType={selectedTab.toLowerCase()} userId={userId} />
    </View>
  );
};

const EventList = ({filterType, userId}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [filterType, userId]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('📌 Kullanıcı ID ile API isteği yapılıyor:', userId);

      const response = await axios.get(
        `https://biletixai.onrender.com/events`,
        {params: {userId}},
      );

      console.log('📌 API Yanıtı:', response.data);

      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ API boş veri döndü.');
      }

      const filteredEvents = (response.data || []).filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        if (filterType === 'upcoming') {
          return eventDate > now;
        } else if (filterType === 'completed') {
          return eventDate < now;
        } else if (filterType === 'cancelled') {
          return event.status === 'cancelled';
        }
        return false;
      });

      console.log(
        `✅ ${filterType.toUpperCase()} tabında ${
          filteredEvents.length
        } etkinlik bulundu.`,
      );
      setEvents(filteredEvents);
    } catch (error) {
      console.error(
        '❌ Etkinlikleri çekerken hata:',
        error.response ? error.response.data : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#6A5ACD"
          style={{marginTop: 20}}
        />
      ) : events.length === 0 ? (
        <Text style={styles.noEventsText}>
          Bu kategoride etkinlik bulunmuyor.
        </Text>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <Animated.View style={styles.eventCard}>
              <Image
                source={{
                  uri: item.images?.[0] || 'https://via.placeholder.com/150',
                }}
                style={styles.eventImage}
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>
                  {new Date(item.date).toLocaleDateString()} -{' '}
                  {new Date(item.date).toLocaleTimeString()}
                </Text>
                <Text style={styles.eventLocation}>{item.location}</Text>
                <Text style={styles.eventStatus}>
                  {item.isPaid ? 'Paid' : 'Free'}
                </Text>
                <View style={styles.buttonContainer}>
                  {filterType === 'upcoming' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => cancelBooking(item._id)}>
                      <Text style={styles.buttonText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.ticketButton}
                    onPress={() =>
                      navigation.navigate('ETicketScreen', {eventId: item._id})
                    }>
                    <Text style={styles.buttonText}>View E-Ticket</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', paddingTop: 10},
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingBottom: 10,
    marginTop: 50,
  },
  tabButton: {
    paddingVertical: 10,
    width: '33%',
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderColor: '#6A5ACD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
  },
  activeTabText: {
    color: '#6A5ACD',
  },
  content: {flex: 1, paddingHorizontal: 10},
  noEventsText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {width: 90, height: 90, borderRadius: 10, marginRight: 10},
  eventDetails: {flex: 1},
  eventTitle: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  eventDate: {fontSize: 14, color: '#777', marginVertical: 4},
  eventLocation: {fontSize: 14, color: '#555'},
  eventStatus: {
    fontSize: 12,
    color: '#6A5ACD',
    fontWeight: 'bold',
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF5A5F',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
  },
  ticketButton: {
    backgroundColor: '#6A5ACD',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {color: 'white', textAlign: 'center', fontWeight: 'bold'},
});

export default MyBookings;
