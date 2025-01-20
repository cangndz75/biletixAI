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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated from 'react-native-reanimated';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MyBookings = () => {
  const [selectedTab, setSelectedTab] = useState('Upcoming');
  const route = useRoute();
  const navigation = useNavigation();
  const [userId, setUserId] = useState(route.params?.userId || null);
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!userId) {
        try {
          const storedUser = await AsyncStorage.getItem('user');
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?._id) {
            console.log('✅ Kullanıcı ID (AsyncStorage):', parsedUser._id);
            setUserId(parsedUser._id);
            setUserEvents(parsedUser.events || []);
          } else {
            console.error('❌ Kullanıcı ID bulunamadı.');
          }
        } catch (error) {
          console.error('❌ AsyncStorage kullanıcı ID çekme hatası:', error);
        }
      }
    };

    fetchUserId();
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

      <EventList
        filterType={selectedTab.toLowerCase()}
        userId={userId}
        userEvents={userEvents}
      />
    </View>
  );
};

const EventList = ({filterType, userId, userEvents}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    if (userId && userEvents.length > 0) {
      fetchEvents();
    }
  }, [filterType, userId, userEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('📌 Kullanıcı ID ile API isteği yapılıyor:', userId);

      const response = await axios.get(
        `https://biletixai.onrender.com/events/user/${userId}`,
      );

      const allEvents = response.data || [];
      console.log('📌 API Yanıtı:', allEvents); 

      const filteredEvents = allEvents.filter(event => {
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

      setEvents(filteredEvents);
    } catch (error) {
      console.error('❌ Etkinlikleri çekerken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async eventId => {
    try {
      await axios.put(
        `https://biletixai.onrender.com/events/${eventId}/cancel`,
        {userId},
      );
      fetchEvents();
    } catch (error) {
      console.error('❌ Etkinlik iptal edilemedi:', error);
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
                source={{uri: item.image || 'https://via.placeholder.com/150'}}
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
});

export default MyBookings;
