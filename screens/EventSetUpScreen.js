import React, {useState, useEffect, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
  Alert,
  FlatList,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthContext} from '../AuthContext';
import {BottomModal, ModalContent, SlideAnimation} from 'react-native-modals';
import axios from 'axios';
import {StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from 'react-native-alert-notification';

const EventSetUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState('none');
  const [selectedTab, setSelectedTab] = useState('About');
  const {item} = route.params;
  const eventId = item?._id;
  const [isFavorited, setIsFavorited] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [rating, setRating] = useState(5);

  useFocusEffect(
    React.useCallback(() => {
      fetchEventDetails(); 
      checkRequestStatus(); 
    }, [eventId]), 
  );

  useEffect(() => {
    const fetchUserAndEventDetails = async () => {
      try {
        const userResponse = await axios.get(
          `https://biletixai.onrender.com/user/${userId}`,
        );
        console.log('User data:', userResponse.data);

        if (item) {
          await fetchEventDetails();
        } else {
          Alert.alert('Error', 'No event data found.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error fetching user or event details:', error);
      }
    };

    fetchUserAndEventDetails().finally(() => setLoading(false));
  }, [item]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}`,
        {
          params: {userId},
        },
      );
      console.log('Event data:', response.data);

      if (response.data.attendees?.some(attendee => attendee._id === userId)) {
        setIsJoined(true);
      } else {
        setIsJoined(false);
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Unable to fetch event details.');
    }
  };

  const toggleFavorite = async () => {
    setIsFavorited(prev => !prev);

    try {
      const response = await axios.post('https://biletixai.onrender.com/favorites', {
        userId,
        eventId: item._id,
      });

      setIsFavorited(response.data.isFavorited);

      Dialog.show({
        type: response.data.isFavorited ? ALERT_TYPE.SUCCESS : ALERT_TYPE.INFO,
        title: response.data.isFavorited
          ? 'Added to Favorites'
          : 'Removed from Favorites',
        textBody: response.data.isFavorited
          ? 'This event has been added to your favorites.'
          : 'This event has been removed from your favorites.',
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);

      setIsFavorited(prev => !prev);

      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody: 'Failed to toggle favorite. Please try again.',
      });
    }
  };

  const fetchReviews = async () => {
    const response = await axios.get(
      `https://biletixai.onrender.com/events/${eventId}/reviews`,
    );
    setReviews(response.data || []);
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Error', 'Please select a rating (1-5).');
      return;
    }

    try {
      console.log('Gönderilen Veri:', {userId, comment, rating});

      const response = await axios.post(
        `https://biletixai.onrender.com/events/${eventId}/reviews`,
        {userId, comment, rating},
        {headers: {'Content-Type': 'application/json'}},
      );

      if (response.status === 201) {
        setReviews(prev => [...prev, response.data.review]);
        setComment('');
        setRating(5);
        ToastAndroid.show('Review added!', ToastAndroid.SHORT);
      } else {
        throw new Error('Failed to add review');
      }
    } catch (error) {
      console.error(
        'Error submitting review:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit review.',
      );
    }
  };

  const checkRequestStatus = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}/requests`,
      );
      const userRequest = response.data.find(req => req.userId === userId);
      if (userRequest) {
        setRequestStatus(userRequest.status);
      } else {
        setRequestStatus('none');
      }
    } catch (error) {
      console.error(
        'Error fetching requests:',
        error.response ? error.response.data : error.message,
      );
      ToastAndroid.show('Failed to check request status.', ToastAndroid.SHORT);
    }
  };

  const renderOrganizerName = () => {
    const organizer = item.organizer;
    return organizer
      ? `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
      : 'Unknown Organizer';
  };

  const sendJoinRequest = async () => {
    try {
      await axios.post(`https://biletixai.onrender.com/events/${eventId}/request`, {
        userId,
        comment,
      });
      setRequestStatus('pending');
      setModalVisible(false);
      Alert.alert('Request Sent', 'Your join request is pending approval.');
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send request.',
      );
    }
  };
  const cancelJoinRequest = async () => {
    try {
      await axios.post(
        `https://biletixai.onrender.com/events/${eventId}/cancel-request`,
        {userId},
      );
      setRequestStatus('none');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel request.');
    }
  };

  const joinEvent = async () => {
    try {
      await axios.post(
        `https://biletixai.onrender.com/events/${eventId}/join`,
        {
          userId,
          comment,
        },
      );
      setIsJoined(true);
      Alert.alert('Success', 'You have joined the event.');
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join the event. Please try again.');
    }
  };

  const renderRatingStars = () => (
    <View style={styles.ratingContainer}>
      {Array(5)
        .fill()
        .map((_, index) => (
          <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
            <Ionicons
              name={index < rating ? 'star' : 'star-outline'}
              size={24}
              color="#ffa500"
              style={{marginRight: 5}}
            />
          </TouchableOpacity>
        ))}
    </View>
  );

  const leaveEvent = async () => {
    try {
      await axios.post(
        `https://biletixai.onrender.com/events/${eventId}/leave`,
        {userId},
      );
      setIsJoined(false);
      Alert.alert('Success', 'You have left the event.');
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave the event. Please try again.');
    }
  };

  const renderGoingSection = () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventAttendees', {eventId})}>
      <FlatList
        horizontal
        data={item.attendees}
        keyExtractor={(attendee, index) => attendee._id + index}
        renderItem={({item: attendee}) => (
          <Image
            source={{uri: attendee.image || 'https://via.placeholder.com/50'}}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              marginHorizontal: 5,
            }}
          />
        )}
        contentContainerStyle={{marginVertical: 10}}
      />
    </TouchableOpacity>
  );

  const renderReviewSection = () => (
    <View style={{marginVertical: 10}}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ReviewScreen', {eventId})}>
        <Text style={{justifyContent: 'space-between', textAlign: 'right'}}>
          See All
        </Text>
      </TouchableOpacity>
      <Text style={{fontWeight: 'bold', fontSize: 18}}>Reviews</Text>

      {renderRatingStars()}

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Send your review"
          value={comment}
          onChangeText={setComment}
          style={styles.textInput}
        />
        <TouchableOpacity onPress={submitReview}>
          <Ionicons name="send" size={24} color="blue" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActionButton = () => {
    if (isJoined) {
      return (
        <View
          style={{
            padding: 15,
            margin: 10,
            backgroundColor: 'gray',
            borderRadius: 4,
          }}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontSize: 15,
              fontWeight: '500',
            }}>
            You participated in this event.
          </Text>
        </View>
      );
    }

    if (requestStatus === 'pending') {
      return (
        <View style={{flexDirection: 'row', margin: 10}}>
          <TouchableOpacity
            style={{
              backgroundColor: 'gray',
              padding: 15,
              flex: 1,
              marginRight: 5,
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 15,
                fontWeight: '500',
              }}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={cancelJoinRequest}
            style={{
              backgroundColor: 'red',
              padding: 15,
              flex: 1,
              marginLeft: 5,
              borderRadius: 4,
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontSize: 15,
                fontWeight: '500',
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: 'green',
          padding: 15,
          margin: 10,
          borderRadius: 4,
        }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 15,
            fontWeight: '500',
          }}>
          Join Event
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Event...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView>
        <View style={{position: 'relative'}}>
          <Image
            source={{
              uri: item?.images?.[0] || 'https://via.placeholder.com/600x300',
            }}
            style={{width: '100%', height: 300, resizeMode: 'cover'}}
          />
          <Text
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: 5,
              borderRadius: 5,
            }}>
            {item.time}
          </Text>
        </View>
        <View style={{position: 'absolute', top: 20, left: 20}}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>

        <View style={{position: 'absolute', top: 20, right: 20}}>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons
              name="heart"
              size={30}
              color={isFavorited ? 'red' : 'white'}
            />
          </TouchableOpacity>
        </View>

        <View style={{padding: 16}}>
          <Text style={{fontSize: 24, fontWeight: 'bold'}}>
            {item?.title || 'Event Title'}
          </Text>
          <View style={{flexDirection: 'row', marginVertical: 10}}>
            <MaterialIcons name="location-on" size={24} color="#5c6bc0" />
            <Text style={{marginLeft: 10}}>
              {item?.location || 'Event Location'}
            </Text>
          </View>

          <Text style={styles.organizerText}>
            Hosted by: {renderOrganizerName()}
          </Text>
          {renderGoingSection()}

          <View style={{flexDirection: 'row', marginTop: 10}}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: selectedTab === 'About' ? 2 : 0,
              }}
              onPress={() => setSelectedTab('About')}>
              <Text>About</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: selectedTab === 'Review' ? 2 : 0,
              }}
              onPress={() => setSelectedTab('Review')}>
              <Text>Review</Text>
            </TouchableOpacity>
          </View>

          {selectedTab === 'About' ? (
            <Text style={{marginVertical: 10}}>
              {item?.description || 'Event Description'}
            </Text>
          ) : (
            renderReviewSection()
          )}

          {renderActionButton()}

          <BottomModal
            visible={modalVisible}
            onTouchOutside={() => setModalVisible(false)}
            modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
            <ModalContent style={{padding: 20}}>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                style={{
                  borderColor: '#ccc',
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: 10,
                  height: 100,
                  textAlignVertical: 'top',
                  marginBottom: 10,
                }}
              />
              <TouchableOpacity
                onPress={submitReview}
                style={{
                  backgroundColor: 'green',
                  padding: 15,
                  borderRadius: 8,
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>
                  Submit Review
                </Text>
              </TouchableOpacity>
            </ModalContent>
          </BottomModal>
          <BottomModal
            onBackdropPress={() => setModalVisible(false)}
            swipeDirection={['up', 'down']}
            swipeThreshold={200}
            modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}
            visible={modalVisible}
            onTouchOutside={() => setModalVisible(false)}>
            <ModalContent
              style={{width: '100%', height: 400, backgroundColor: 'white'}}>
              <View>
                <Text style={{fontSize: 15, fontWeight: '500', color: 'gray'}}>
                  Join Event
                </Text>
                <Text style={{marginTop: 25, color: 'gray'}}>
                  Please enter a message to send with your join request.
                </Text>
                <View
                  style={{
                    borderColor: '#E0E0E0',
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 10,
                    height: 200,
                    marginTop: 20,
                  }}>
                  <TextInput
                    value={comment}
                    onChangeText={text => setComment(text)}
                    placeholder="Send a message to the host along with your request!"
                    style={{height: 100, textAlignVertical: 'top'}}
                  />
                  <Pressable
                    onPress={sendJoinRequest}
                    style={{
                      marginTop: 'auto',
                      backgroundColor: 'green',
                      borderRadius: 5,
                      justifyContent: 'center',
                      padding: 10,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 15,
                        fontWeight: '500',
                      }}>
                      Send Request
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ModalContent>
          </BottomModal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventSetUpScreen;

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
});
