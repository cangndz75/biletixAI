import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Amenities from '../components/Amenities';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const VenueInfoScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {venueId} = route.params;
  const {userId} = useContext(AuthContext);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Events');

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/venues/${venueId}`,
        );
        setVenue(response.data);
      } catch (error) {
        console.error('Error fetching venue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [venueId]);

  const fetchVenueAndEvents = async () => {
    try {
      console.log('Route params:', route.params);

      const venueResponse = await axios.get(
        `https://biletixai.onrender.com/venues/${venueId}`,
      );
      setVenue(venueResponse.data);
      setAmenities(venueResponse.data.amenities || []);

      const eventsResponse = await axios.get(
        `https://biletixai.onrender.com/venues/${venueId}/events`,
      );
      setEvents(eventsResponse.data);

      const reviewsResponse = await axios.get(
        `https://biletixai.onrender.com/venues/${venueId}/reviews`,
      );
      setReviews(reviewsResponse.data);

      console.log('Fetched Venue Data:', venueResponse.data);
      console.log('Fetched Events Data:', eventsResponse.data);
    } catch (error) {
      console.error('Error fetching venue, events, and reviews:', error);
    } finally {
      setLoading(false);
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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={{
          position: 'absolute',
          top: 40, 
          left: 20, 
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          padding: 10,
          borderRadius: 20,
          zIndex: 1,
        }}>
        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
      <FlatList
        ListHeaderComponent={
          <>
            <Image
              style={{width: '100%', height: 250, resizeMode: 'cover'}}
              source={{uri: venue.image || 'https://via.placeholder.com/250'}}
            />
            <View
              style={{padding: 16, backgroundColor: '#fff', borderRadius: 20}}>
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

              <Amenities venueId={venueId} />

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
              </View>
            </View>
          </>
        }
        data={selectedTab === 'Events' ? venue.eventsAvailable : []} 
        renderItem={selectedTab === 'Events' ? renderEventItem : null}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={{paddingHorizontal: 16}}
      />
    </SafeAreaView>
  );
};

export default VenueInfoScreen;
