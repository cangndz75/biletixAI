import {SafeAreaView, View, Image, Pressable, Text, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useRoute, useNavigation} from '@react-navigation/native';
import axios from 'axios';

const ManageRequests = () => {
  const [option, setOption] = useState('Requests');
  const route = useRoute();
  const navigation = useNavigation();
  const eventId = route?.params?.eventId;

  const [requests, setRequests] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [invited] = useState([]);
  const [retired] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchAttendees();
  }, [eventId]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}/requests`,
      );
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const fetchAttendees = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/event/${eventId}/attendees`,
      );
      setAttendees(response.data);
    } catch (error) {
      console.error('Failed to fetch attendees:', error);
    }
  };

  const acceptRequest = async (userId, requestId, eventId) => {
    try {
      const response = await axios.post(`https://biletixai.onrender.com/accept`, {
        userId,
        requestId,
        eventId,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Request accepted');
        fetchEventDetails();
        checkRequestStatus();
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      Alert.alert('Error', 'Failed to accept request');
    }
  };

  const rejectRequest = async (requestId, eventId) => {
    try {
      const response = await axios.post(`https://biletixai.onrender.com/reject`, {
        requestId,
        eventId,
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Request rejected');
        fetchRequests();
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Error', 'Failed to reject request');
    }
  };

  return (
    <SafeAreaView>
      <View style={{padding: 12, backgroundColor: '#223536'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
          <AntDesign name="plussquareo" size={24} color="white" />
        </View>

        <View style={{marginTop: 15, flexDirection: 'row', gap: 15}}>
          {['Requests', 'Invited', 'Playing', 'Retired'].map(tab => (
            <Pressable key={tab} onPress={() => setOption(tab)}>
              <Text
                style={{
                  fontWeight: '500',
                  color: option === tab ? '#1dd132' : 'white',
                }}>
                {tab} (
                {tab === 'Requests'
                  ? requests.length
                  : tab === 'Playing'
                  ? attendees.length
                  : 0}
                )
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{marginTop: 10, marginHorizontal: 15}}>
        {option === 'Requests' && (
          <View>
            {requests.length === 0 ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 6,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', fontSize: 16}}>
                  No requests
                </Text>
              </View>
            ) : (
              requests.map((item, index) => (
                <Pressable
                  key={index}
                  style={{
                    padding: 10,
                    backgroundColor: 'white',
                    marginVertical: 10,
                    borderRadius: 6,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 13,
                    }}>
                    <Image
                      style={{width: 50, height: 50, borderRadius: 25}}
                      source={{uri: item?.image}}
                    />

                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontWeight: '600',
                        }}>{`${item?.firstName} ${item?.lastName}`}</Text>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          marginTop: 10,
                          borderRadius: 20,
                          borderColor: 'orange',
                          borderWidth: 1,
                          alignSelf: 'flex-start',
                        }}>
                        <Text style={{fontSize: 13}}>INTERMEDIATE</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={{marginTop: 8}}>{item?.comment}</Text>

                  <View
                    style={{
                      height: 1,
                      borderColor: '#E0E0E0',
                      borderWidth: 0.7,
                      marginVertical: 15,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          backgroundColor: '#E0E0E0',
                          borderRadius: 5,
                          alignSelf: 'flex-start',
                        }}>
                        <Text style={{fontSize: 14, color: 'gray'}}>
                          0 NO SHOWS
                        </Text>
                      </View>
                      <Text
                        style={{
                          marginTop: 10,
                          fontWeight: 'bold',
                          textDecorationLine: 'underline',
                        }}>
                        See Reputation
                      </Text>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                      }}>
                      <Pressable
                        style={{
                          padding: 10,
                          borderRadius: 6,
                          borderColor: '#E0E0E0',
                          borderWidth: 1,
                          width: 100,
                        }}>
                        <Text style={{textAlign: 'center'}}>RETIRE</Text>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          acceptRequest(item.userId, item._id, eventId)
                        }
                        style={{
                          padding: 10,
                          borderRadius: 6,
                          backgroundColor: '#26bd37',
                          width: 100,
                        }}>
                        <Text style={{textAlign: 'center', color: 'white'}}>
                          ACCEPT
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {option === 'Playing' && (
          <View>
            {attendees.length === 0 ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 6,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', fontSize: 16}}>
                  No attendees
                </Text>
              </View>
            ) : (
              attendees.map((item, index) => (
                <Pressable
                  key={index}
                  style={{
                    marginVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}>
                  <View>
                    <Image
                      style={{width: 60, height: 60, borderRadius: 30}}
                      source={{uri: item?.image}}
                    />
                  </View>

                  <View>
                    <Text>{`${item?.firstName} ${item?.lastName}`}</Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        marginTop: 10,
                        borderRadius: 20,
                        borderColor: 'orange',
                        borderWidth: 1,
                        alignSelf: 'flex-start',
                      }}>
                      <Text style={{fontSize: 13, fontWeight: '400'}}>
                        INTERMEDIATE
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {option === 'Invited' && (
          <View>
            {invited.length === 0 ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 6,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', fontSize: 16}}>
                  No invited players
                </Text>
              </View>
            ) : (
              <Text>Invited players will be shown here.</Text>
            )}
          </View>
        )}

        {option === 'Retired' && (
          <View>
            {retired.length === 0 ? (
              <View
                style={{
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: 6,
                  alignItems: 'center',
                }}>
                <Text style={{fontWeight: '500', fontSize: 16}}>
                  No retired players
                </Text>
              </View>
            ) : (
              <Text>Retired players will be shown here.</Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ManageRequests;
