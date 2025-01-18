import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const ReviewScreen = ({route, navigation}) => {
  const eventId = route?.params?.eventId;
  const [reviews, setReviews] = useState([]);
  const [averageScore, setAverageScore] = useState(0.0);
  const [selectedFilter, setSelectedFilter] = useState('All time');

  useEffect(() => {
    if (eventId) {
      fetchReviews();
    } else {
      Alert.alert('Error', 'No event ID provided.');
      navigation.goBack();
    }
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/events/${eventId}/reviews`,
      );
      setReviews(response.data || []);
      calculateAverageScore(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reviews.');
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

  const renderReviewItem = ({item}) => (
    <View style={styles.reviewItem}>
      <Image
        source={{uri: item.userImage || 'https://via.placeholder.com/50'}}
        style={styles.userImage}
      />
      <View style={{flex: 1}}>
        <Text style={styles.userName}>{item.userName}</Text>
        <View style={styles.starsContainer}>
          {Array(5)
            .fill()
            .map((_, index) => (
              <Ionicons
                key={index}
                name={index < (item.rating || 0) ? 'star' : 'star-outline'}
                size={16}
                color="#ffa500"
              />
            ))}
        </View>
        <Text>{item.review}</Text>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
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

      <View style={styles.averageScoreContainer}>
        <Text style={styles.averageScore}>{averageScore.toFixed(1)}</Text>
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
        {['All time', 'This month', 'This year', 'This week'].map(filter => (
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
        ))}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderReviewItem}
        style={styles.reviewList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: 'white', padding: 10},
  header: {flexDirection: 'row', alignItems: 'center', padding: 15},
  headerTitle: {fontSize: 18, fontWeight: 'bold', marginLeft: 10},
  averageScoreContainer: {alignItems: 'center', marginVertical: 10},
  averageScore: {fontSize: 48, fontWeight: 'bold'},
  starsContainer: {flexDirection: 'row', marginTop: 5},
  reviewList: {flex: 1, marginVertical: 10},
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userImage: {width: 50, height: 50, borderRadius: 25, marginRight: 10},
  userName: {fontWeight: 'bold'},
  reviewDate: {fontSize: 12, color: '#888', marginTop: 5},
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
});

export default ReviewScreen;
