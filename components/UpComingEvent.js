import React, {useContext, useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const UpComingEvent = ({item}) => {
  const navigation = useNavigation();
  const {userId, role} = useContext(AuthContext);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchEventData();
    }, [item]),
  );

  const fetchEventData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${item?._id}`,
      );
      setEventData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch event data.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEventData();
    setRefreshing(false);
  };

  const handleEdit = () => {
    navigation.navigate('AdminEventSetUp', {item: eventData});
  };

  const handleManage = () => {
    navigation.navigate('ManageRequest', {
      eventId: eventData?._id,
      userId,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  if (!eventData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noEventText}>No Events</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[eventData]}
      keyExtractor={item => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({item}) => (
        <View style={styles.eventCard}>
          <Text style={styles.dateText}>
            {new Date(item.date).toDateString()}
          </Text>
          <View style={styles.row}>
            <Image
              style={styles.eventImage}
              source={{
                uri: item.images?.[0] || 'https://via.placeholder.com/100',
              }}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventLocation}>{item.location}</Text>
              <Text style={styles.hostedBy}>
                Hosted by {item.organizerName}
              </Text>
            </View>
          </View>
          {role === 'organizer' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManage}>
                <Text style={styles.buttonText}>Manage</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
};

export default UpComingEvent;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noEventText: {
    fontSize: 18,
    color: '#888',
    marginTop: 8,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventLocation: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  hostedBy: {
    fontSize: 14,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    backgroundColor: '#5c6bc0',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  manageButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
