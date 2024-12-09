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
      if (!eventId) {
        Alert.alert('Error', 'Invalid event ID.');
        navigation.goBack();
        return;
      }

      try {
        console.log(
          `Fetching attendees from: https://biletixai.onrender.com/event/${eventId}/attendees`,
        );
        const response = await axios.get(
          `https://biletixai.onrender.com/event/${eventId}/attendees`,
        );

        if (response.status === 200) {
          setAttendees(response.data || []);
          console.log('Attendees fetched:', response.data);
        } else {
          Alert.alert('Error', 'No attendees found for this event.');
        }
      } catch (error) {
        console.error('Failed to fetch attendees:', error.message);
        const errorMessage =
          error.response?.data?.message || 'Failed to load attendees.';
        Alert.alert('Error', errorMessage);
      }
    };

    fetchAttendees();
  }, []);

  const fetchAttendees = async () => {
    if (!eventId) return;

    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/event/${eventId}/attendees`,
      );
      if (response.status === 200) {
        setAttendees(response.data || []);
        console.log('Attendees fetched:', response.data);
      } else {
        Alert.alert('Error', 'Attendees not found.');
      }
    } catch (error) {
      console.error('Failed to fetch attendees:', error.message);
      Alert.alert('Error', 'Failed to load attendees.');
    }
  };

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
        <View
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            flexDirection: 'row',
            gap: 15,
          }}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
          <Entypo name="share" size={24} color="#fff" />
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
              <Text style={{color: '#5c6bc0'}}>Music</Text>
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

          <TouchableOpacity
            style={{
              backgroundColor: '#5c6bc0',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              marginVertical: 10,
            }}>
            <Text style={{color: '#fff'}}>Add to My Calendar</Text>
          </TouchableOpacity>

          {/* Location Section */}
          <View style={{flexDirection: 'row', marginVertical: 10}}>
            <MaterialIcons name="location-on" size={24} color="#5c6bc0" />
            <View style={{marginLeft: 10}}>
              <Text style={{fontWeight: 'bold', color: '#333'}}>
                {route?.params?.item?.location ||
                  'Grand Park, New York City, US'}
              </Text>
              <Text style={{color: '#666'}}>
                Grand City St. 100, New York, United States.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#5c6bc0',
              borderRadius: 10,
              paddingVertical: 10,
              alignItems: 'center',
              marginBottom: 20,
            }}>
            <Text style={{color: '#fff'}}>See Location on Maps</Text>
          </TouchableOpacity>

          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={{
                uri: organizer?.imageUrl || 'https://via.placeholder.com/150',
              }}
              style={{width: 60, height: 60, borderRadius: 30}}
            />
            <View style={{marginLeft: 10}}>
              <Text style={{fontSize: 18, fontWeight: 'bold'}}>
                {organizer?.name || 'World of Music'}
              </Text>
              <Text style={{color: 'gray'}}>Organizer</Text>
            </View>
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
            <Pressable
              style={{flexDirection: 'row', alignItems: 'center', gap: 14}}>
              <View
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
                  style={{width: 30, height: 30, resizeMode: 'contain'}}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/343/343303.png',
                  }}
                />
              </View>

              <Text style={{fontSize: 15, fontWeight: '500', flex: 1}}>
                Add Co-Host
              </Text>

              <MaterialCommunityIcons
                style={{textAlign: 'center'}}
                name="chevron-right"
                size={24}
                color="black"
              />
            </Pressable>

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
                    style={{width: 30, height: 30, resizeMode: 'contain'}}
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/128/1474/1474545.png',
                    }}
                  />
                </Pressable>
                <Text
                  style={{
                    marginTop: 8,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}>
                  Add
                </Text>
              </Pressable>

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

              <Pressable
                onPress={() =>
                  navigation.navigate('Players', {
                    players: attendees,
                  })
                }
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    padding: 10,
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 12,
                  }}>
                  <MaterialCommunityIcons
                    style={{textAlign: 'center'}}
                    name="chevron-right"
                    size={24}
                    color="black"
                  />
                </View>

                <Text
                  style={{
                    marginBottom: 12,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                  All Players
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

            <View style={{flexDirection: 'row', alignItems: 'center', gap: 15}}>
              <View
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
                  style={{width: 30, height: 30, resizeMode: 'contain'}}
                  source={{
                    uri: 'https://cdn-icons-png.flaticon.com/128/1511/1511847.png',
                  }}
                />
              </View>

              <View>
                <Text>Not on Playo? Invite</Text>
                <Text style={{marginTop: 6, color: 'gray', width: '80%'}}>
                  Earn 100 Karma points by referring your friend
                </Text>
              </View>
            </View>
          </View>
          <Pressable
            onPress={() =>
              navigation.navigate('Players', {
                players: attendees,
              })
            }
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              borderTopColor: '#E0E0E0',
              borderTopWidth: 1,
              borderBottomColor: '#E0E0E0',
              borderBottomWidth: 1,
              marginBottom: 20,
            }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                padding: 10,
                borderColor: '#E0E0E0',
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 12,
              }}>
              <MaterialCommunityIcons
                style={{textAlign: 'center'}}
                name="chevron-right"
                size={24}
                color="black"
              />
            </View>

            <Text style={{marginBottom: 12, fontWeight: '600'}}>
              All Players
            </Text>
          </Pressable>
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
