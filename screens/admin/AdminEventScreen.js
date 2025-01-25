import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
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

      // Fetch events filtered by organizer's userId
      const response = await axios.get(
        `https://biletixai.onrender.com/events`,
        {params: {organizer: userId}}, // Filtering by organizer
      );

      if (response.status === 200) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.headerContainer}>
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
              <Text style={styles.createButtonText}>+ Create Event</Text>
            </Pressable>

            <View style={styles.eventSection}>
              <Text style={styles.sectionTitle}>My Events</Text>
            </View>
          </View>
        }
        data={events}
        renderItem={({item}) => <UpComingEvent item={item} />}
        keyExtractor={item => item._id}
        numColumns={2} // Displays events in a 2-column grid
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventList}
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Ionicons name="calendar-outline" size={48} color="#888" />
            <Text style={styles.noEventText}>No Events Found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminEventScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10, // Adds horizontal padding
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noEventText: {
    fontSize: 18,
    color: '#888',
    marginTop: 8,
  },
  headerContainer: {
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  eventList: {
    paddingBottom: 20,
  },
});
