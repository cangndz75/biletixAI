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
  Modal,
  TextInput,
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedEventData, setEditedEventData] = useState({});

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
    setEditedEventData({
      title: eventData.title || '',
      location: eventData.location || '',
      description: eventData.description || '',
      date: eventData.date || '',
      images: eventData.images || [],
      organizerName: eventData.organizerName || '',
    });
    setEditModalVisible(true);
  };

  const saveChanges = async () => {
    try {
      const response = await axios.put(
        `https://biletixai.onrender.com/events/${eventData?._id}`,
        editedEventData,
        {headers: {'Content-Type': 'application/json'}},
      );
      setEventData(response.data);
      Alert.alert('Success', 'Event updated successfully!');
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update the event.');
    }
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
    <>
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
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEdit}>
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

      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              value={editedEventData.title}
              onChangeText={text =>
                setEditedEventData({...editedEventData, title: text})
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Event Location"
              value={editedEventData.location}
              onChangeText={text =>
                setEditedEventData({...editedEventData, location: text})
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Event Description"
              value={editedEventData.description}
              onChangeText={text =>
                setEditedEventData({...editedEventData, description: text})
              }
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#5c6bc0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
