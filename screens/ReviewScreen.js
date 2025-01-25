import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import Animated, {FadeInUp, FadeOutDown} from 'react-native-reanimated';
import {BottomModal, ModalContent, SlideAnimation} from 'react-native-modals';
import {TextInput} from 'react-native-paper';
import {AuthContext} from '../AuthContext';
import {useFocusEffect} from '@react-navigation/native';
import {SwipeListView} from 'react-native-swipe-list-view';

const ReviewScreen = ({route, navigation}) => {
  const {userId} = useContext(AuthContext);
  const eventId = route?.params?.eventId;
  const [reviews, setReviews] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('All time');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [userReview, setUserReview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [eventDatePassed, setEventDatePassed] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetchReviews();
    }, [eventId, userId]),
  );
  useEffect(() => {
    if (eventId) {
      fetchReviews();
      checkEventDate();
    } else {
      Alert.alert('Error', 'No event ID provided.');
      navigation.goBack();
    }
  }, [eventId]);

  const checkEventDate = () => {
    if (route?.params?.eventDate) {
      const eventDateTime = new Date(route.params.eventDate).getTime();
      const currentDateTime = new Date().getTime();
      setEventDatePassed(eventDateTime < currentDateTime);
    }

    if (route?.params?.attendees?.some(attendee => attendee._id === userId)) {
      setIsJoined(true);
    }
  };

  const deleteReview = async reviewId => {
    try {
      await axios.delete(
        `https://biletixai.onrender.com/events/${eventId}/reviews/${reviewId}`,
      );
      setUserReview(null);
      fetchReviews();
      Alert.alert('Success', 'Your review has been deleted.');
    } catch (error) {
      Alert.alert('Error', 'Failed to delete review.');
    }
  };

  const renderHiddenItem = ({item}) => {
    if (item.userId !== userId) return null;

    return (
      <View style={styles.hiddenItemContainer}>
        <TouchableOpacity
          style={[styles.hiddenButton, {backgroundColor: 'red'}]}
          onPress={() => deleteReview(item._id)}>
          <Text style={styles.hiddenButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}/reviews`,
      );
      setReviews(response.data || []);
      calculateAverageScore(response.data);

      const userOwnReview = response.data.find(
        review => review.userId === userId,
      );
      setUserReview(userOwnReview);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = reviews => {
    if (reviews.length === 0) {
      setAverageScore(0.0);
      return;
    }
    const totalScore = reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0,
    );
    setAverageScore(totalScore / reviews.length);
  };

  const submitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }
    try {
      if (userReview) {
        await axios.put(
          `https://biletixai.onrender.com/events/${eventId}/reviews/${userReview._id}`,
          {userId, comment, rating},
          {headers: {'Content-Type': 'application/json'}},
        );
      } else {
        await axios.post(
          `https://biletixai.onrender.com/events/${eventId}/reviews`,
          {userId, comment, rating},
          {headers: {'Content-Type': 'application/json'}},
        );
      }
      setModalVisible(false);
      fetchReviews();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  const renderReviewItem = ({item}) => (
    <View style={styles.reviewCard}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading reviews...</Text>
        </View>
      ) : (
        <>
          <View style={styles.averageScoreContainer}>
            <Animated.Text entering={FadeInUp} style={styles.averageScore}>
              {averageScore !== null ? averageScore.toFixed(1) : '...'}
            </Animated.Text>
            <View style={styles.starsContainer}>
              {Array(5)
                .fill()
                .map((_, index) => (
                  <Ionicons
                    key={index}
                    name={
                      index < Math.floor(averageScore) ? 'star' : 'star-outline'
                    }
                    size={20}
                    color="#ffa500"
                  />
                ))}
            </View>
          </View>
          <View style={styles.filterContainer}>
            {['All time', 'This month', 'This year', 'This week'].map(
              filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterButton,
                    selectedFilter === filter && styles.activeFilterButton,
                  ]}
                  onPress={() => setSelectedFilter(filter)}>
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.activeFilterText,
                    ]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>

          {/* ✅ Kendi yorumlarını kaydırarak silebilme özelliği eklenmiş hali */}
          <SwipeListView
            data={reviews}
            keyExtractor={item => item._id}
            renderItem={renderReviewItem}
            renderHiddenItem={({item}) =>
              item.userId === userId ? ( // Sadece kendi yorumları için göster
                <View style={styles.hiddenItemContainer}>
                  <TouchableOpacity
                    style={[styles.hiddenButton, {backgroundColor: 'red'}]}
                    onPress={() => deleteReview(item._id)}>
                    <Text style={styles.hiddenButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
            rightOpenValue={-75} // Kaydırma mesafesi
          />

          {isJoined && eventDatePassed && !userReview && (
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={() => setModalVisible(true)}>
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          )}

          <BottomModal
            visible={modalVisible}
            onTouchOutside={() => setModalVisible(false)}
            modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
            <ModalContent style={styles.modalContent}>
              <Text style={styles.modalTitle}>Submit a Comment</Text>
              <Text style={styles.modalSubtitle}>How was your experience?</Text>

              <View style={styles.ratingContainer}>
                {Array(5)
                  .fill()
                  .map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setRating(index + 1)}>
                      <Ionicons
                        name={index < rating ? 'star' : 'star-outline'}
                        size={32}
                        color="#7C3AED"
                      />
                    </TouchableOpacity>
                  ))}
              </View>

              <Text style={styles.inputLabel}>Write Your Review</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Share your experience..."
                  style={styles.textInput}
                  multiline
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, {backgroundColor: '#E0E0E0'}]}
                  onPress={() => setModalVisible(false)}>
                  <Text style={{color: 'black', fontWeight: '600'}}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={submitReview}>
                  <Text style={{color: 'white', fontWeight: '600'}}>
                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </ModalContent>
          </BottomModal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white', padding: 10},
  header: {flexDirection: 'row', alignItems: 'center', padding: 15},
  headerTitle: {fontSize: 18, fontWeight: 'bold', marginLeft: 10},
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  averageScoreContainer: {alignItems: 'center', marginVertical: 10},
  averageScore: {fontSize: 48, fontWeight: 'bold'},
  starsContainer: {flexDirection: 'row', marginTop: 5},
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  activeFilterButton: {backgroundColor: '#ffa500'},
  filterText: {fontSize: 14, color: '#333'},
  activeFilterText: {color: 'white'},
  reviewList: {flex: 1, marginVertical: 10},
  reviewCard: {
    backgroundColor: '#D4F6E5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  userInfo: {flex: 1},
  userName: {fontWeight: 'bold', fontSize: 16},
  reviewDate: {fontSize: 12, color: '#888'},
  ratingContainer: {flexDirection: 'row', marginBottom: 5},
  reviewText: {fontSize: 14, color: '#333'},
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  inputContainer: {
    backgroundColor: '#F3F3F3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  textInput: {
    minHeight: 80,
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#7C3AED',
  },
});

export default ReviewScreen;
