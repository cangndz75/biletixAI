import React, {useEffect, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';

const EventAttendeesScreen = () => {
  const route = useRoute();
  const {eventId} = route.params;
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/event/${eventId}/attendees`,
        );
        setAttendees(response.data);
      } catch (error) {
        console.error('Error fetching attendees:', error);
        Alert.alert('Error', 'Failed to load attendees.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [eventId]);

  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.attendeeItem}
      onPress={() => navigation.navigate('ProfileView', {userId: item._id})}>
      <Image
        source={{uri: item.image || 'https://via.placeholder.com/50'}}
        style={styles.profileImage}
      />
      <View style={{marginLeft: 10}}>
        <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>
    </TouchableOpacity>
    
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  return (
    <FlatList
      data={attendees}
      keyExtractor={item => item._id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  attendeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#888',
  },
  listContainer: {
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventAttendeesScreen;
