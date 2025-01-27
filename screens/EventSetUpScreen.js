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
import Animated, {FadeInUp, FadeOutDown} from 'react-native-reanimated';
const API_BASE_URL = 'https://biletixai.onrender.com';

const EventSetUpScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId, user} = useContext(AuthContext);
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
  const [expanded, setExpanded] = useState(false);
  const [attendees, setAttendees] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      fetchEventDetails();
      checkRequestStatus();
    }, [eventId]),
  );

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    console.log('Updated Event Data:', item);
  }, [item]);

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
        {params: {userId}},
      );

      let eventAttendees =
        response.data.attendees || response.data.data?.attendees || [];

      console.log('Attendees Response:', eventAttendees);

      const userJoined = eventAttendees.some(att => att._id === userId);
      setIsJoined(userJoined);

      if (eventAttendees.length > 0 && typeof eventAttendees[0] === 'object') {
        setAttendees(eventAttendees);
        return;
      }

      const attendeesData = await Promise.all(
        eventAttendees.map(async attendeeId => {
          try {
            const userRes = await axios.get(
              `https://biletixai.onrender.com/user/${attendeeId}`,
            );
            return userRes.data;
          } catch (error) {
            console.error(`Error fetching attendee ${attendeeId}:`, error);
            return null;
          }
        }),
      );

      setAttendees(attendeesData.filter(user => user !== null));
    } catch (error) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Unable to fetch event details.');
    }
  };

  const toggleFavorite = async () => {
    setIsFavorited(prev => !prev);

    try {
      const response = await axios.post(
        'https://biletixai.onrender.com/favorites',
        {
          userId,
          eventId: item._id,
        },
      );

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
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}/reviews`,
      );
      setReviews(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reviews.');
    }
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
      await axios.post(
        `https://biletixai.onrender.com/events/${eventId}/request`,
        {
          userId,
          comment,
        },
      );
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

  const renderReviewItem = ({item}) => (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutDown}
      style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          source={{uri: item.userImage || 'https://via.placeholder.com/50'}}
          style={styles.userImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        {Array(5)
          .fill()
          .map((_, index) => (
            <Ionicons
              key={index}
              name={index < (item.rating || 0) ? 'star' : 'star-outline'}
              size={18}
              color="#2ECC71"
            />
          ))}
      </View>

      <Text style={styles.reviewText}>{item.review}</Text>
    </Animated.View>
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

  const renderGoingSection = () => {
    console.log('Attendees Data:', attendees);

    if (!attendees || attendees.length === 0) {
      return null;
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 10,
        }}>
        <FlatList
          horizontal
          data={attendees.slice(-5)}
          keyExtractor={attendee => attendee._id}
          renderItem={({item: attendee}) => (
            <Image
              source={{
                uri:
                  attendee.image && attendee.image.startsWith('http')
                    ? attendee.image
                    : 'https://via.placeholder.com/50',
              }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                marginHorizontal: 5,
                borderWidth: 2,
                borderColor: '#4CAF50',
              }}
            />
          )}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('EventAttendees', {eventId})}
          style={{marginLeft: 10}}>
          <Ionicons name="arrow-forward-circle" size={30} color="#1E90FF" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderReviewSection = () => (
    <View style={{marginVertical: 10, paddingHorizontal: 16}}>
      <Animated.View entering={FadeInUp} exiting={FadeOutDown}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ReviewScreen', {eventId})}
          style={{
            alignSelf: 'flex-end',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            backgroundColor: '#f0f0f0',
          }}>
          <Text style={{color: '#1E90FF', fontWeight: '600'}}>See All</Text>
        </TouchableOpacity>

        {reviews.length === 0 && (
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              color: 'gray',
              marginTop: 10,
            }}>
            There are no comments on this event. {'\n'}
            Press the “see all” button to check your commenting status.
          </Text>
        )}
      </Animated.View>
      {/* <Text style={{fontWeight: 'bold', fontSize: 18, marginBottom: 10}}>
        Reviews
      </Text> */}

      {/* {renderRatingStars()} */}

      {isJoined && new Date(item?.time) < new Date() && (
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={() => navigation.navigate('ReviewScreen', {eventId})}>
          <Ionicons
            name="heart"
            size={20}
            color="white"
            style={{marginRight: 8}}
          />
          <Text style={styles.reviewButtonText}>Leave a review</Text>
        </TouchableOpacity>
      )}

      <View style={{height: 1, backgroundColor: '#ddd', marginVertical: 10}} />

      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        {reviews.slice(-3).map((review, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp}
            exiting={FadeOutDown}
            style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image
                source={{
                  uri: review.userImage || 'https://via.placeholder.com/50',
                }}
                style={styles.userImage}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{review.userName}</Text>
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.ratingContainer}>
              {Array(5)
                .fill()
                .map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < (review.rating || 0) ? 'star' : 'star-outline'}
                    size={18}
                    color="#2ECC71"
                  />
                ))}
            </View>

            <Text style={styles.reviewText}>{review.review}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );

  const handleEventPayment = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/create-checkout-session/event`,
        {
          price: item.price,
          userId,
          eventId: item._id,
        },
      );

      if (response.data.url) {
        navigation.navigate('WebViewScreen', {url: response.data.url});
      } else {
        alert('Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

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

    if (item.isPaid) {
      return (
        <TouchableOpacity
          onPress={handleEventPayment}
          style={{
            backgroundColor: '#4CAF50',
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
            Pay and Join (${item.price})
          </Text>
        </TouchableOpacity>
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
  const MAX_DESCRIPTION_LENGTH = 150;
  const eventDescription =
    item?.description || 'No description available for this event.';
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
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 5,
            }}>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginLeft: 3}}>
              {item?.title || 'Event Title'}
            </Text>

            {item?.attendees?.length > 0 && user?.vipBadge && (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{fontSize: 16, fontWeight: 'bold', marginLeft: 5}}>
                  {item?.attendees?.length}
                </Text>
                <Text> </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: isJoined ? 'green' : 'gray',
                  }}>
                  Going
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4,
              justifyContent: 'space-between',
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="location-outline" size={18} color="gray" />
              <Text style={{fontSize: 16, color: 'gray', marginLeft: 3}}>
                {item?.location}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#F5F5F5',
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
              }}>
              <Ionicons name="calendar-outline" size={18} color="#444" />
              <Text style={{fontSize: 14, color: '#444', marginLeft: 5}}>
                {item?.date}
              </Text>
            </View>
          </View>

          <View style={styles.organizerCard}>
            <View style={styles.organizerInfo}>
              {item?.organizer?.image ? (
                <Image
                  source={{uri: item.organizer.image}}
                  style={styles.organizerImage}
                />
              ) : (
                <View style={styles.organizerIcon}>
                  <Text style={styles.organizerInitial}>
                    {item?.organizer?.firstName
                      ? item.organizer.firstName.charAt(0)
                      : 'E'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.organizerName}>
                  {item?.organizer
                    ? `${item.organizer?.firstName || ''} ${
                        item.organizer?.lastName || ''
                      }`.trim() || 'Event Organizer'
                    : 'Event Organizer'}
                </Text>
                <Text style={styles.organizerRole}>Event Creator</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.plusButton}
              onPress={() =>
                navigation.navigate('ProfileView', {
                  userId: item?.organizer?._id,
                })
              }>
              <Ionicons
                name="chevron-forward-outline"
                size={22}
                color="#F5A623"
              />
            </TouchableOpacity>
          </View>

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
            <View style={{padding: 10}}>
              <Text style={styles.eventDescription}>
                {expanded || eventDescription.length <= MAX_DESCRIPTION_LENGTH
                  ? eventDescription
                  : `${eventDescription.substring(
                      0,
                      MAX_DESCRIPTION_LENGTH,
                    )}...`}
              </Text>
              {eventDescription.length > MAX_DESCRIPTION_LENGTH && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                  <Text style={styles.seeMoreText}>
                    {expanded ? 'See Less' : 'See More'}
                  </Text>
                </TouchableOpacity>
              )}
              {renderActionButton()}
            </View>
          ) : (
            renderReviewSection()
          )}
          {!item.isPaid && (
            <>
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
                  style={{
                    width: '100%',
                    height: 400,
                    backgroundColor: 'white',
                  }}>
                  <View>
                    <Text
                      style={{fontSize: 15, fontWeight: '500', color: 'gray'}}>
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventSetUpScreen;

const styles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', padding: 15},
  headerTitle: {fontSize: 18, fontWeight: 'bold', marginLeft: 10},
  tabContainer: {flexDirection: 'row', marginVertical: 10},
  tabButton: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {borderBottomColor: '#000'},
  tabText: {fontSize: 16, fontWeight: 'bold'},
  eventDescription: {padding: 10, fontSize: 14, color: '#555'},
  reviewHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  reviewSectionTitle: {fontWeight: 'bold', fontSize: 18},
  seeAllButton: {fontSize: 14, color: '#1E90FF', fontWeight: '600'},
  reviewList: {flex: 1, marginVertical: 10},
  reviewCard: {
    backgroundColor: '#D4F6E5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 5},
  userImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  userInfo: {flex: 1},
  userName: {fontWeight: 'bold', fontSize: 16},
  reviewDate: {fontSize: 12, color: '#888'},
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  reviewText: {fontSize: 14, color: '#333'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  textInput: {flex: 1, height: 40, paddingHorizontal: 10},
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  reviewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  organizerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: -15,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  organizerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  organizerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5A623',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  organizerRole: {
    fontSize: 12,
    color: '#999',
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#F5A623',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
  },
});
