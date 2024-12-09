import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';
import UpComingEvent from '../../components/UpComingEvent';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminEventScreen = () => {
  const [events, setEvents] = useState([]);
  const {userId, role} = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId && role === 'organizer') {
      fetchOrganizerEvents();
    }
  }, [userId, role]);

  const fetchOrganizerEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://biletixai.onrender.com/events`,
        {params: {organizerId: userId}},
      );

      if (response.status === 200 && response.data.length === 0) {
        console.warn('No events found for this organizer.');
        setEvents([]);
      } else {
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error.response) {
        if (error.response.status === 404) {
          console.error('No events found for the given organizer ID.');
        } else {
          console.error(
            `Server responded with status ${error.response.status}`,
          );
        }
      } else {
        console.error('Network error or server unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.noEventText}>No Events Found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#000"
            onPress={() => navigation.goBack()}
            style={styles.backIcon}
          />
          <Text style={styles.headerTitle}>My Events</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('AdminCreate')}
          style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Event</Text>
        </Pressable>

        <View style={styles.eventSection}>
          <View style={styles.eventHeader}>
            <Text style={styles.sectionTitle}>My Events</Text>
            <Pressable onPress={() => fetchOrganizerEvents()}>
              <Text style={styles.seeAllText}>See All</Text>
            </Pressable>
          </View>

          <FlatList
            horizontal
            data={events}
            renderItem={({item}) => <UpComingEvent item={item} />}
            keyExtractor={item => item._id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventText: {
    fontSize: 18,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#07bc0c',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventSection: {
    paddingHorizontal: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  seeAllText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  eventList: {
    paddingVertical: 10,
  },
});
