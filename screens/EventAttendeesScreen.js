import React, {useEffect, useState, useContext} from 'react';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../AuthContext'; 

const EventAttendeesScreen = () => {
  const route = useRoute();
  const {eventId} = route.params;
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);

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
    <View style={styles.attendeeItem}>
      <Image
        source={{uri: item.image || 'https://via.placeholder.com/50'}}
        style={styles.profileImage}
      />
      <View style={{marginLeft: 10}}>
        <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
      </View>

      {item._id !== userId && (
        <TouchableOpacity
          style={styles.viewProfileButton}
          onPress={() =>
            navigation.navigate('ProfileView', {userId: item._id})
          }>
          <Text style={styles.viewProfileText}>View</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.header}>Attendees</Text>

      <FlatList
        data={attendees}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
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
  viewProfileButton: {
    marginLeft: 'auto',
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  viewProfileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventAttendeesScreen;
