import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StarRating from 'react-native-star-rating-widget';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const VenueInfoScreen = () => {
  const route = useRoute();
  const {venueId} = route.params;
  const {userId} = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Events');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchVenueAndEvents = async () => {
      try {
        const venueResponse = await axios.get(
          `https://biletixai.onrender.com/venues/${venueId}`,
        );
        setVenue(venueResponse.data);

        const eventsResponse = await axios.get(
          `https://biletixai.onrender.com/venues/${venueId}/events`,
        );
        setEvents(eventsResponse.data);

        const reviewsResponse = await axios.get(
          `https://biletixai.onrender.com/venues/${venueId}/reviews`,
        );
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Error fetching venue, events, and reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueAndEvents();
  }, [venueId]);

  const handleReviewSubmit = async () => {
    if (!comment.trim() || rating === 0) return;
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/venues/${venueId}/reviews`,
        {
          userId,
          rating,
          comment,
        },
      );
      setReviews(prev => [...prev, response.data.review]);
      setComment('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Venue...</Text>
      </View>
    );
  }

  const renderEventItem = ({item}) => (
    <View
      style={{
        width: ITEM_WIDTH,
        marginVertical: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 3,
        overflow: 'hidden',
      }}>
      <Image
        source={{uri: item.image || 'https://via.placeholder.com/150'}}
        style={{width: '100%', height: 100}}
      />
      <View style={{padding: 10}}>
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>{item.title}</Text>
        <Text style={{fontSize: 14, color: '#555'}}>
          {item.eventType} | ${item.price || 'TBA'}
        </Text>
        <Text style={{fontSize: 12, color: '#777'}}>
          {item.location} on {item.date} at {item.time}
        </Text>
      </View>
    </View>
  );

  const renderReviews = () => (
    <View style={{marginVertical: 10}}>
      {reviews.length ? (
        reviews.map((review, index) => (
          <View
            key={index}
            style={{
              marginBottom: 10,
              padding: 10,
              backgroundColor: '#f1f1f1',
              borderRadius: 8,
            }}>
            <Text style={{fontWeight: 'bold'}}>
              {review.userName || 'Anonymous'}
            </Text>
            <StarRating
              rating={review.rating}
              onChange={() => {}}
              starSize={20}
              readonly
            />
            <Text>{review.comment}</Text>
            <Text style={{color: 'gray', fontSize: 12}}>
              {new Date(review.reviewedAt).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text>No comments available.</Text>
      )}
      <View style={{marginTop: 10}}>
        <StarRating rating={rating} onChange={setRating} starSize={30} />
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Type your review..."
          style={{
            marginTop: 10,
            padding: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
          }}
        />
        <Pressable
          onPress={handleReviewSubmit}
          style={{
            backgroundColor: 'green',
            padding: 15,
            marginTop: 10,
            borderRadius: 8,
            alignItems: 'center',
          }}>
          <Text style={{color: 'white'}}>Submit Review</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderHeader = () => {
    if (!venue) return null;

    return (
      <>
        <Image
          style={{width: '100%', height: 250, resizeMode: 'cover'}}
          source={{uri: venue.image || 'https://via.placeholder.com/250'}}
        />
        <View style={{padding: 16, backgroundColor: '#fff', borderRadius: 20}}>
          <Text style={{fontSize: 24, fontWeight: 'bold'}}>
            {venue.name || 'Unknown Venue'}
          </Text>
          <View style={{flexDirection: 'row', marginVertical: 5}}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={24}
              color="#555"
            />
            <Text style={{marginLeft: 8}}>
              {venue.location || 'Unknown Location'}
            </Text>
          </View>
          <View style={{flexDirection: 'row', marginVertical: 5}}>
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#555"
            />
            <Text style={{marginLeft: 8}}>
              Organized by: {venue.organizer || 'Unknown'}
            </Text>
          </View>
          <View style={{flexDirection: 'row', marginTop: 10}}>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: selectedTab === 'Events' ? 2 : 0,
              }}
              onPress={() => setSelectedTab('Events')}>
              <Text>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: selectedTab === 'Reviews' ? 2 : 0,
              }}
              onPress={() => setSelectedTab('Reviews')}>
              <Text>Reviews</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={selectedTab === 'Events' ? events : []}
        renderItem={selectedTab === 'Events' ? renderEventItem : null}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={{paddingHorizontal: 16}}
        ListEmptyComponent={
          selectedTab === 'Events' ? (
            <Text style={{textAlign: 'center', marginVertical: 20}}>
              No events available.
            </Text>
          ) : (
            renderReviews()
          )
        }
      />
    </SafeAreaView>
  );
};

export default VenueInfoScreen;