import {
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TagVenueScreen = () => {
  const [venues, setVenues] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await axios.get('http://10.0.2.2:8000/venues');
        setVenues(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchVenues();
  }, []);

  const [taggedVenue, setTaggedVenue] = useState(null);
  useEffect(() => {
    if (taggedVenue) {
      navigation.goBack({taggedVenue});
    }
  }, [taggedVenue, navigation]);

  const handleSelectVenue = venue => {
    navigation.navigate('AdminCreate', {taggedVenue: venue});
  };
  return (
    <SafeAreaView>
      <View
        style={{padding: 10, backgroundColor: '#294461', paddingBottom: 10}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}>
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text style={{color: 'white', fontSize: 15, fontWeight: 'bold'}}>
            Tag Venue
          </Text>
        </View>
      </View>
      <FlatList
        data={venues}
        renderItem={({item}) => (
          <Pressable
            onPress={() => handleSelectVenue(item?.name)}
            style={{
              padding: 10,
              marginVertical: 10,
              borderColor: '#e0e0e0',
              borderWidth: 1,
              marginHorizontal: 10,
            }}>
            <View>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Image
                  style={{
                    width: 90,
                    height: 90,
                    resizeMode: 'cover',
                    borderRadius: 7,
                  }}
                  source={{uri: item?.image}}
                />
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 15,
                      fontWeight: '500',
                      width: '100%',
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item?.name}
                  </Text>
                  <Text style={{marginTop: 4, color: 'gray'}}>
                    {item?.address}
                  </Text>
                  <Text
                    style={{marginTop: 7, fontWeight: '500', color: 'grey'}}>
                    {item?.rating}
                  </Text>
                </View>
                <Ionicons
                  name="shield-checkmark-sharp"
                  size={24}
                  color="green"
                />
              </View>
              <View style={{marginTop: 5}}>
                <Text style={{textAlign: 'center', color: 'gray'}}>
                  BOOKABLE
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

export default TagVenueScreen;

const styles = StyleSheet.create({});
