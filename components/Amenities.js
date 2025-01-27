import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://biletixai.onrender.com';

const Amenities = ({venueId}) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  const services = [
    {id: '0', name: 'Bar'},
    {id: '1', name: 'Free Wi-Fi'},
    {id: '2', name: 'Toilets'},
    {id: '3', name: 'Changing Rooms'},
    {id: '4', name: 'Drinking Water'},
    {id: '5', name: 'Food Stalls'},
    {id: '6', name: 'VIP Lounge'},
    {id: '7', name: 'Coat Check'},
    {id: '8', name: 'Parking'},
    {id: '9', name: 'First Aid Station'},
  ];

  useEffect(() => {
    const fetchAmenities = async () => {
      if (!venueId) return;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/venues/${venueId}/amenities`,
        );
        if (response.status === 200) {
          const fetchedAmenities = Array.isArray(response.data)
            ? response.data
            : [];

          const filteredAmenities = services.filter(service =>
            fetchedAmenities.includes(service.name),
          );

          setAmenities(filteredAmenities);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, [venueId]);

  const renderAmenity = ({item}) => (
    <View style={styles.amenityCard}>
      <Text style={styles.amenityText}>{item.name}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text>Loading Amenities...</Text>
      </View>
    );
  }

  if (amenities.length === 0) {
    return (
      <View style={styles.noAmenitiesContainer}>
        <Text style={styles.noAmenitiesText}>No Amenities Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Facilities & Amenities</Text>
      <FlatList
        data={amenities}
        renderItem={renderAmenity}
        keyExtractor={item => item.id}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{paddingBottom: 10}}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Amenities;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  amenityCard: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    width: '30%',
  },
  amenityText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAmenitiesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noAmenitiesText: {
    fontSize: 16,
    color: '#777',
  },
});
