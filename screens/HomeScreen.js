import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {favorites, setFavorites} = useContext(AuthContext);
  const [eventList, setEventList] = useState([]);
  const [popularEvent, setPopularEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = [
    'All',
    'Sports',
    'Concert',
    'Football',
    'Theatre',
    'Dance',
  ];
  const filterEventsByCategory = (events, category) => {
    if (category === 'All') return events;
    return events.filter(event => event.eventType === category.toLowerCase());
  };

  const filteredEvents = filterEventsByCategory(eventList, selectedCategory);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          'https://biletixai.onrender.com/events',
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        setEventList(response.data);
        if (response.data.length > 0) {
          setPopularEvent(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = async eventId => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      const favoritesArray = storedFavorites ? JSON.parse(storedFavorites) : [];
      const isFavorite = favoritesArray.includes(eventId);

      const updatedFavorites = isFavorite
        ? favoritesArray.filter(id => id !== eventId)
        : [...favoritesArray, eventId];

      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#5c6bc0" />
        <Text>Loading events...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#f8f8f8', padding: 16}}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={{uri: 'https://example.com/profile.jpg'}}
            style={{width: 50, height: 50, borderRadius: 25, marginRight: 10}}
          />
          <View>
            <Text style={{color: '#777', fontSize: 16}}>Good Morning 👋</Text>
            <Text style={{fontSize: 18, fontWeight: 'bold'}}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F5F5F5',
          borderRadius: 10,
          padding: 10,
          marginBottom: 20,
        }}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#777"
          style={{marginRight: 5}}
        />
        <TextInput
          placeholder="What event are you looking for..."
          style={{flex: 1, fontSize: 16}}
        />
        <TouchableOpacity>
          <Ionicons name="options-outline" size={20} color="#777" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 20}}>
        {[
          {title: 'Music Festivals', image: 'https://picsum.photos/200'},
          {title: 'Sport Events', image: 'https://picsum.photos/201'},
          {title: 'Fashion Shows', image: 'https://picsum.photos/202'},
          {title: 'Book Fair', image: 'https://picsum.photos/203'},
        ].map((category, index) => (
          <Pressable key={index} style={{marginRight: 10}}>
            <ImageBackground
              source={{uri: category.image}}
              style={{
                width: 120,
                height: 150,
                borderRadius: 15,
                overflow: 'hidden',
                justifyContent: 'flex-end',
                padding: 10,
              }}
              imageStyle={{borderRadius: 15}}>
              <View
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  padding: 5,
                  borderRadius: 5,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}>
                  {category.title}
                </Text>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{marginBottom: 20}}>
        <Text style={{fontSize: 18, fontWeight: '700', marginBottom: 10}}>
          Upcoming Event
        </Text>
        {popularEvent && (
          <Pressable
            onPress={() => navigation.navigate('Event', {item: popularEvent})}
            style={{borderRadius: 15, overflow: 'hidden'}}>
            <ImageBackground
              source={{uri: popularEvent.organizerUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqG-InngmdJ4Ifg1hcdSKJM9y9vdYIobP1Ya-1f10vV2yclcqd"}}
              style={{height: 200, justifyContent: 'flex-end', padding: 10}}>
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  padding: 10,
                  borderRadius: 10,
                }}>
                <Text style={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>
                  {popularEvent.title}
                </Text>
                <Text style={{color: '#fff'}}>{popularEvent.date}</Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleFavorite(popularEvent._id)}
                style={{position: 'absolute', top: 10, right: 10}}>
                <Ionicons
                  name={
                    favorites && favorites.includes(popularEvent._id)
                      ? 'heart'
                      : 'heart-outline'
                  }
                  size={28}
                  color="#FFF"
                />
              </TouchableOpacity>
            </ImageBackground>
          </Pressable>
        )}
      </View>

      <View style={{flex: 1, backgroundColor: '#f8f8f8', padding: 16}}>
        {/* Kategori başlıkları */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 10, marginBottom: 10}}>
          {categories.map((category, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedCategory(category)}
              style={{
                backgroundColor:
                  selectedCategory === category ? '#7b61ff' : '#f5f5f5',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 15,
                marginRight: 10,
              }}>
              <Text
                style={{
                  color: selectedCategory === category ? 'white' : '#333',
                  fontWeight: 'bold',
                }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Popular bölüm */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700'}}>Popular</Text>
          <TouchableOpacity onPress={() => console.log('See all clicked')}>
            <Text style={{color: '#7b61ff', fontWeight: 'bold'}}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Event Listesi veya "No Events" Görünümü */}
        <View style={{flex: 1}}>
          {filteredEvents.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredEvents.map(item => (
                <Pressable
                  key={item._id}
                  onPress={() => navigation.navigate('EventDetails', {item})}
                  style={{
                    width: 180,
                    marginRight: 15,
                    backgroundColor: '#fff',
                    borderRadius: 15,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 2},
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                  }}>
                  <Image
                    source={{
                      uri: item.organizerUrl || 'https://picsum.photos/200',
                    }}
                    style={{
                      width: '100%',
                      height: 120,
                      borderTopLeftRadius: 15,
                      borderTopRightRadius: 15,
                    }}
                  />
                  <View style={{padding: 10}}>
                    <Text style={{fontSize: 16, fontWeight: '700'}}>
                      {item.title}
                    </Text>
                    <Text style={{fontSize: 14, color: '#777', marginTop: 5}}>
                      {item.location}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 5,
                      }}>
                      <Ionicons name="time-outline" size={14} color="#777" />
                      <Text
                        style={{fontSize: 12, color: '#777', marginLeft: 5}}>
                        {item.date}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Ionicons
                name="calendar-outline"
                size={64}
                color="#888"
                style={{marginBottom: 10}}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#888',
                  textAlign: 'center',
                }}>
                No Events
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 15,
          padding: 15,
          marginVertical: 20,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 5,
          alignItems: 'center',
        }}>
        <View style={{flex: 1, paddingRight: 10}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 5}}>
            Brown Lamp
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#7b61ff',
              fontWeight: '700',
              marginBottom: 5,
            }}>
            New Collection Special Sale Up to 70%
          </Text>
          <Text style={{fontSize: 14, color: '#777', marginBottom: 10}}>
            Lorem ipsum is placeholder text commonly used in the graphic.
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#7b61ff',
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Shop Now</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{uri: 'https://picsum.photos/200'}}
          style={{width: 100, height: 100, resizeMode: 'contain'}}
        />
      </View>

      <View
        style={{
          backgroundColor: '#fff',
          paddingVertical: 20,
          alignItems: 'center',
          borderTopWidth: 1,
          borderColor: '#e0e0e0',
          marginTop: 20,
        }}>
        <Text style={{fontSize: 14, color: '#888'}}>© 2024 EventMate</Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
