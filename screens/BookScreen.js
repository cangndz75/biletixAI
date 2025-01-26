import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import VenueCard from '../components/VenueCard';

const BookScreen = ({navigation}) => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVenues = async () => {
    try {
      const response = await axios.get('https://biletixai.onrender.com/venues');
      setVenues(response.data);
      setFilteredVenues(response.data);
    } catch (error) {
      console.error('Error fetching venues:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);
    const filteredData = venues.filter(venue =>
      venue.name.toLowerCase().includes(query.toLowerCase()),
    );
    setFilteredVenues(filteredData);
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Venues...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <View
        style={{
          marginHorizontal: 12,
          backgroundColor: '#F5F5F5',
          paddingVertical: 10,
          paddingHorizontal: 15,
          flexDirection: 'row',
          borderRadius: 25,
          marginTop: 10,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 3,
        }}>
        <TextInput
          placeholder="Search"
          placeholderTextColor="#888"
          style={{
            flex: 1,
            fontSize: 16,
            color: '#333',
          }}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Pressable onPress={handleSearch} style={{marginLeft: 10}}>
          <Ionicons name="search" size={22} color="#444" />
        </Pressable>
      </View>

      <FlatList
        data={filteredVenues}
        renderItem={({item}) => (
          <VenueCard
            item={item}
            onPress={() =>
              navigation.navigate('VenueInfo', {venueId: item._id})
            }
          />
        )}
        keyExtractor={item =>
          item._id ? item._id.toString() : Math.random().toString()
        }
      />
    </SafeAreaView>
  );
};

export default BookScreen;
