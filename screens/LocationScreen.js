import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const cities = {
  Istanbul: ['Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bostancı'],
  Ankara: ['Çankaya', 'Keçiören', 'Mamak'],
  Izmir: ['Konak', 'Bornova', 'Karşıyaka'],
};

const LocationScreen = () => {
  const navigation = useNavigation();
  const [selectedCity, setSelectedCity] = useState(null); 

  const handleCityPress = city => {
    console.log(`City selected: ${city}`);
    setSelectedCity(city);
  };

  const handleDistrictPress = district => {
    console.log(`District selected: ${district}`);
    navigation.navigate('EventsForLocation', {
      city: selectedCity,
      district: district,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <Text style={styles.title}>Select Your Location</Text>

      {!selectedCity ? (
        <FlatList
          data={Object.keys(cities)}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleCityPress(item)}>
              <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={cities[selectedCity]}
          keyExtractor={item => item}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleDistrictPress(item)}>
              <Text style={styles.text}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {padding: 15, borderBottomWidth: 1, borderBottomColor: '#ddd'},
  text: {fontSize: 16},
  backButton: {alignSelf: 'flex-start'},
});

export default LocationScreen;
