import React, {useState, useEffect} from 'react';
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

const ReviewScreen = ({route, navigation}) => {
  const eventId = route?.params?.eventId;
  const [reviews, setReviews] = useState([]);
  const [averageScore, setAverageScore] = useState(null); // Başlangıçta null yapıldı
  const [selectedFilter, setSelectedFilter] = useState('All time');
  const [loading, setLoading] = useState(true); // Loading durumu eklendi

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
    } finally {
      setLoading(false); // Yükleme tamamlandıktan sonra loading kapanacak
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Reviews</Text>
      </View>

      {/* Eğer loading true ise, yükleniyor göstergesi */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Loading reviews...</Text>
        </View>
      ) : (
        <>
          {/* Ortalama Puan */}
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

          {/* Filtreleme Seçenekleri */}
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

          {/* Yorum Listesi */}
          <FlatList
            data={reviews}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderReviewItem}
            style={styles.reviewList}
          />
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
});

export default ReviewScreen;
