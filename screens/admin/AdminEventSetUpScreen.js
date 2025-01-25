import React, {useState, useContext, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  Pressable,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BottomModal, ModalContent, SlideAnimation} from 'react-native-modals';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import {EventContext} from '../../EventContext';

const AdminEventSetUpScreen = () => {
  const {updateEvent} = useContext(EventContext);
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [organizer, setOrganizer] = useState(null);
  const [requests, setRequests] = useState([]);
  const [eventData, setEventData] = useState(route?.params?.item || {});
  const eventId = route?.params?.item?._id;
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const times = ['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM'];

  useEffect(() => {
    setOrganizer(route?.params?.item?.organizer || null);
  }, [route?.params?.item]);

  useEffect(() => {
    const fetchAttendees = async () => {
      if (!eventId) return;
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/event/${eventId}/attendees`,
        );
        setAttendees(response.data || []);
      } catch (error) {
        console.error('Failed to fetch attendees:', error.message);
      }
    };

    fetchAttendees();
  }, []);

  const openEditModal = () => {
    setEditModalVisible(true);
  };

  const handleUpdateEvent = async () => {
    if (userId !== organizer?._id) {
      Alert.alert('Unauthorized', 'Only the organizer can update this event.');
      return;
    }

    try {
      const response = await axios.put(
        `https://biletixai.onrender.com/event/${eventId}`,
        eventData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        Alert.alert('Success', 'Event updated successfully!');
        updateEvent(response.data);
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update event.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage);
    }
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = moment().add(i, 'days');
      let displayDate = date.format('Do MMMM');
      if (i === 0) displayDate = 'Today';
      else if (i === 1) displayDate = 'Tomorrow';
      dates.push({
        id: i.toString(),
        displayDate,
        actualDate: date.format('YYYY-MM-DD'),
      });
    }
    return dates;
  };

  const selectDate = selectedDate => {
    setEventData({...eventData, date: selectedDate});
    setModalVisible(false);
  };

  const selectTime = selectedTime => {
    setEventData({...eventData, time: selectedTime});
    setTimeModalVisible(false);
  };

  const dates = generateDates();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView>
        <Image
          source={{
            uri:
              route?.params?.item?.images?.[0] ||
              'https://via.placeholder.com/600x300',
          }}
          style={{width: '100%', height: 300, resizeMode: 'cover'}}
        />
        <View style={{position: 'absolute', top: 20, left: 20}}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={{padding: 16}}>
          <Text style={{fontSize: 24, fontWeight: 'bold', color: '#333'}}>
            {route?.params?.item?.title || 'National Music Festival'}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <TouchableOpacity
              style={{
                borderColor: '#5c6bc0',
                borderRadius: 20,
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              <Text style={{color: '#5c6bc0'}}>
                {' '}
                {route?.params?.item?.eventType || ''}
              </Text>
            </TouchableOpacity>
            <View
              style={{
                marginLeft: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {attendees.slice(0, 4).map((attendee, index) => (
                <Image
                  key={index}
                  source={{
                    uri: attendee.imageUrl || 'https://via.placeholder.com/150',
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginLeft: index === 0 ? 0 : -10,
                  }}
                />
              ))}
              <Text style={{marginLeft: 10, color: '#333'}}>
                {attendees.length}+ going
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <MaterialIcons name="location-on" size={24} color="#5c6bc0" />
            <Text style={{marginLeft: 8, fontSize: 16, color: '#333'}}>
              {eventData?.location || 'Event Location'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={openEditModal}
            style={{
              backgroundColor: '#5c6bc0',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <Text style={{color: '#fff'}}>Edit Event</Text>
          </TouchableOpacity>
          <View>
            <View
              style={{
                height: 1,
                borderWidth: 0.5,
                borderColor: '#E0E0E0',
                marginVertical: 12,
              }}
            />

            <View
              style={{
                height: 1,
                borderWidth: 0.5,
                borderColor: '#E0E0E0',
                marginVertical: 12,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Pressable>
                <Pressable
                  onPress={() =>
                    navigation.navigate('ManageRequest', {
                      requests: requests,
                      userId: userId,
                      eventId: eventId,
                    })
                  }
                  style={{
                    width: 60,
                    height: 60,
                    borderWidth: 1,
                    borderColor: '#E0E0E0',
                    borderRadius: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    style={{
                      width: 30,
                      height: 30,
                      resizeMode: 'contain',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/7928/7928637.png',
                    }}
                  />
                </Pressable>
                <Text
                  style={{
                    marginTop: 8,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}>
                  Manage ({requests?.length})
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                height: 1,
                borderWidth: 0.5,
                borderColor: '#E0E0E0',
                marginVertical: 12,
              }}
            />
          </View>
        </View>
      </ScrollView>
      <BottomModal
        visible={editModalVisible}
        onTouchOutside={() => setEditModalVisible(false)}
        modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
        <ModalContent style={{padding: 20}}>
          <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 15}}>
            Edit Event Details
          </Text>
          <TextInput
            style={{
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Event Title"
            value={eventData.title}
            onChangeText={text => setEventData({...eventData, title: text})}
          />
          <TextInput
            style={{
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Event Location"
            value={eventData.location}
            onChangeText={text => setEventData({...eventData, location: text})}
          />
          <TextInput
            style={{
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginBottom: 10,
            }}
            placeholder="Event Description"
            value={eventData.description}
            onChangeText={text =>
              setEventData({...eventData, description: text})
            }
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#5c6bc0',
              borderRadius: 10,
              padding: 10,
              alignItems: 'center',
              marginTop: 10,
            }}
            onPress={handleUpdateEvent}>
            <Text style={{color: '#fff'}}>Save Changes</Text>
          </TouchableOpacity>
        </ModalContent>
      </BottomModal>
    </SafeAreaView>
  );
};

export default AdminEventSetUpScreen;
