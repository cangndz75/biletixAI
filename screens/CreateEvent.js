import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BottomModal, SlideAnimation, ModalContent} from 'react-native-modals';
import moment from 'moment';
import {AuthContext} from '../AuthContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateEvent = () => {
  const [event, setEvent] = useState('');
  const [area, setArea] = useState('');
  const [date, setDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('');
  const [noOfParticipants, setNoOfParticipants] = useState(0);
  const [selectedType, setSelectedType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const [taggedVenue] = useState(null);
  const {userId} = useContext(AuthContext);
  console.log(userId);

  useEffect(() => {
    const {timeInterval, taggedVenue} = route?.params || {};
    console.log('Tagged Venue:', taggedVenue);
    if (timeInterval) setTimeInterval(timeInterval);
    if (taggedVenue) {
      setArea(taggedVenue);
    }
  }, [route?.params]);

  const eventTypes = ['concert', 'football', 'theater', 'dance', 'other'];

  const toggleEventType = type => {
    console.log('Selected Type: ', type);
    setSelectedType(type);
  };

  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    console.log('Received Token:', token);
    if (!token) return res.status(401).send('No token provided');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        console.log('Token verification error:', err);
        return res.status(403).send('Invalid token');
      }
      req.user = user;
      next();
    });
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = moment().add(i, 'days');
      let displayDate;
      if (i === 0) {
        displayDate = 'Today';
      } else if (i === 1) {
        displayDate = 'Tomorrow';
      } else if (i === 2) {
        displayDate = 'Day After';
      } else {
        displayDate = date.format('Do MMMM');
      }
      dates.push({
        id: i.toString(),
        displayDate,
        dayOfWeek: date.format('ddd'),
        actualDate: date.format('Do MMMM'),
      });
    }
    return dates;
  };
  const dates = generateDates();

  const selectDate = date => {
    setModalVisible(false);
    setDate(date);
  };
  console.log('Event: ', event);
  console.log('Area: ', area);
  console.log('Date: ', date);
  console.log('Time Interval: ', timeInterval);
  console.log('Selected Type: ', selectedType);
  console.log('User ID: ', userId);

  const createEvent = async (req, res, next) => {
    authenticateToken(req, res, async () => {
      try {
        if (!userId) {
          Alert.alert('Error', 'User is not authenticated.');
          return;
        }

        if (
          !event ||
          !area ||
          !date ||
          !timeInterval ||
          !selectedType ||
          !noOfParticipants
        ) {
          Alert.alert('Error', 'All fields are required.');
          return;
        }

        const participantsCount = parseInt(noOfParticipants, 10);
        if (isNaN(participantsCount) || participantsCount <= 0) {
          Alert.alert('Error', 'Please enter a valid number for participants.');
          return;
        }

        const eventData = {
          title: event,
          location: area,
          date,
          time: timeInterval,
          eventType: selectedType.toLowerCase(),
          totalParticipants: participantsCount,
          organizer: userId,
        };

        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token); // Log token for debugging

        if (!token) {
          Alert.alert('Error', 'Authentication token is missing.');
          return;
        }

        const response = await axios.post(
          'http://10.0.2.2:8000/createevent',
          eventData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 200) {
          Alert.alert('Success!', 'Event created successfully!', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Event', {refresh: true}),
            },
          ]);

          setEvent('');
          setArea('');
          setDate('');
          setTimeInterval('');
          setNoOfParticipants('');
        } else {
          Alert.alert('Error', 'Unexpected response. Please try again.');
        }
      } catch (error) {
        console.error(
          'Failed to create event:',
          error?.response?.data || error,
        );
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            'Failed to create event. Please try again.',
        );
      }
    });
  };

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: 'white',
          paddingTop: Platform.OS === 'android' ? 35 : 0,
        }}>
        <ScrollView>
          <View style={{marginHorizontal: 10}}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </View>
          <View style={{padding: 10}}>
            <Text style={{color: 'black', fontWeight: 'bold', fontSize: 25}}>
              Create Event
            </Text>
            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginTop: 15,
                marginVertical: 15,
              }}>
              <MaterialIcons name="add-a-photo" size={24} color="black" />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>
                  Event
                </Text>
                <TextInput
                  value={event}
                  onChangeText={setEvent}
                  style={{marginTop: 7, fontSize: 15, color: 'black'}}
                  placeholder="Enter event name"
                  placeholderTextColor="gray"
                />
              </View>
              <AntDesign name="right" size={24} color="black" />
            </Pressable>

            <Text
              style={{
                fontSize: 17,
                fontWeight: '500',
                color: 'black',
                marginBottom: 10,
              }}>
              Event Type
            </Text>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 20}}>
              {eventTypes.map(type => (
                <Pressable
                  key={type}
                  onPress={() => toggleEventType(type)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 10,
                    backgroundColor:
                      selectedType === type ? '#4CAF50' : '#F0F0F0',
                    borderRadius: 10,
                    marginBottom: 10,
                  }}>
                  <FontAwesome
                    name={
                      selectedType === type ? 'check-circle' : 'circle-thin'
                    }
                    size={24}
                    color={selectedType === type ? 'white' : 'gray'}
                  />
                  <Text
                    style={{
                      marginLeft: 15,
                      fontSize: 16,
                      fontWeight: '500',
                      color: selectedType === type ? 'white' : 'black',
                    }}>
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={() => navigation.navigate('TagVenue')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginTop: 15,
                marginVertical: 15,
              }}>
              <Entypo name="location" size={24} color="black" />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>
                  Event Location
                </Text>
                <TextInput
                  value={area ? area : taggedVenue}
                  onChangeText={setArea}
                  style={{marginTop: 7, fontSize: 15, color: 'black'}}
                  placeholder="Enter event area"
                  placeholderTextColor="gray"
                />
              </View>
              <AntDesign name="right" size={24} color="black" />
            </Pressable>
            <Pressable
              onPress={() => setModalVisible(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginTop: 15,
                marginVertical: 15,
              }}>
              <Feather name="calendar" size={24} color="black" />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>
                  Date
                </Text>
                <TextInput
                  editable={false}
                  value={date}
                  onChangeText={setDate}
                  style={{marginTop: 7, fontSize: 15, color: 'black'}}
                  placeholderTextColor={date ? 'black' : 'gray'}
                  placeholder={date ? date : 'Pick a day'}
                />
              </View>
              <AntDesign name="right" size={24} color="black" />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Time')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 20,
                marginTop: 15,
                marginVertical: 15,
              }}>
              <AntDesign name="clockcircleo" size={24} color="black" />
              <View style={{flex: 1}}>
                <Text style={{fontSize: 17, fontWeight: '500', color: 'black'}}>
                  Time
                </Text>
                <TextInput
                  editable={false}
                  value={timeInterval}
                  onChangeText={setTimeInterval}
                  style={{marginTop: 7, fontSize: 15, color: 'black'}}
                  placeholderTextColor={timeInterval ? 'black' : 'gray'}
                  placeholder={timeInterval ? timeInterval : 'Pick Exact Time'}
                />
              </View>
              <AntDesign name="right" size={24} color="black" />
            </Pressable>
            <Text style={{marginTop: 20, fontSize: 16, color: 'black'}}>
              Total Participants
            </Text>
            <View
              style={{
                padding: 10,
                backgroundColor: '#F0F0F0',
                marginTop: 10,
                borderRadius: 6,
              }}>
              <View style={{marginVertical: 5}}>
                <View>
                  <TextInput
                    value={noOfParticipants}
                    onChangeText={setNoOfParticipants}
                    style={{
                      padding: 10,
                      backgroundColor: 'white',
                      borderColor: '#D0D0D0',
                      borderWidth: 1,
                      borderRadius: 4,
                    }}
                    placeholder="Total Participants (including you)"
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Pressable
        onPress={createEvent}
        style={{
          backgroundColor: '#07bc0c',
          marginTop: 'auto',
          marginBottom: 30,
          padding: 12,
          marginHorizontal: 10,
          borderRadius: 4,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 15,
            fontWeight: '500',
          }}>
          Create Event
        </Text>
      </Pressable>

      <BottomModal
        visible={modalVisible}
        onTouchOutside={() => setModalVisible(false)}
        swipeDirection={['up', 'down']}
        modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}
        onBackdropPress={() => setModalVisible(false)}
        swipeThreshold={200}
        onHardwareBackPress={() => setModalVisible(false)}>
        <ModalContent
          style={{width: '100%', height: 400, backgroundColor: 'white'}}>
          <View>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 15}}>
              Choose Date
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}>
              {dates.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => selectDate(item.actualDate)}
                  style={{
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 10,
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    width: '30%',
                    alignItems: 'center',
                  }}>
                  <Text>{item.displayDate}</Text>
                  <Text style={{color: 'gray', marginTop: 7}}>
                    {item.dayOfWeek}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default CreateEvent;
