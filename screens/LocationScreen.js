import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const cities = [
  {
    name: 'Istanbul',
    image:
      'https://images.unsplash.com/photo-1699811136524-6405676e9b05?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Ankara',
    image:
      'https://images.unsplash.com/photo-1587810427695-d4670dbf1d36?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Izmir',
    image:
      'https://images.unsplash.com/photo-1663015397240-5c3ecea900fc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

const districts = {
  Istanbul: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bostancı'],
  Ankara: ['Çankaya', 'Keçiören', 'Mamak'],
  Izmir: ['Konak', 'Bornova', 'Karşıyaka'],
};

const LocationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedCity, setSelectedCity] = useState(
    route.params?.selectedCity || null,
  );

  const handleCityPress = city => {
    setSelectedCity(city);
  };

  const handleDistrictPress = district => {
    navigation.navigate('EventsForLocation', {
      city: selectedCity,
      district,
    });
  };

  return (
    <View style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {selectedCity
          ? `Select a District in ${selectedCity}`
          : 'Select Your City'}
      </Text>

      {!selectedCity ? (
        <FlatList
          data={cities}
          keyExtractor={item => item.name}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.cityCard}
              onPress={() => handleCityPress(item.name)}>
              <ImageBackground
                source={{uri: item.image}}
                style={styles.cityImage}
                imageStyle={{borderRadius: 16}}>
                <View style={styles.overlay} />
                <Text style={styles.cityText}>{item.name}</Text>
              </ImageBackground>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      ) : (
        <FlatList
          data={districts[selectedCity]}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.districtCard}
              onPress={() => handleDistrictPress(item)}>
              <Text style={styles.districtText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  cityCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
  },
  cityImage: {
    width: width - 30,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  cityText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  districtCard: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  districtText: {
    fontSize: 16,
    color: '#444',
    fontWeight: 'bold',
  },
  flatListContent: {
    paddingBottom: 20,
  },
});

export default LocationScreen;
