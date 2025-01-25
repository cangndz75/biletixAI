import React, {useCallback, useContext, useEffect, useState} from 'react';
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
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import AdsCarousel from '../components/AdsCarousel';

const HomeScreen = () => {
  const navigation = useNavigation();
  const {favorites, setFavorites} = useContext(AuthContext);
  const [eventList, setEventList] = useState([]);
  const [popularEvent, setPopularEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const {userId} = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const categories = [
    'All',
    'Sports',
    'Concert',
    'Football',
    'Theatre',
    'Dance',
  ];
  const filterEventsByCategoryAndLocation = (
    events,
    category,
    city,
    district,
  ) => {
    let filtered = events;
    if (category !== 'All') {
      filtered = filtered.filter(
        event => event.eventType === category.toLowerCase(),
      );
    }
    if (city) {
      filtered = filtered.filter(event => event.city === city);
    }
    if (district) {
      filtered = filtered.filter(event => event.district === district);
    }
    return filtered;
  };
  const active = useSharedValue(false);
  const progress = useDerivedValue(() => {
    return withTiming(active.value ? 1 : 0);
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      progress.value,
      [0, 1],
      [0, -10],
      Extrapolation.CLAMP,
    );
    const scale = withTiming(active.value ? 0.9 : 1);
    const translateX = active.value ? withSpring(50) : withTiming(0);
    const borderRadius = withTiming(active.value ? 20 : 0);
    return {
      transform: [
        {perspective: 1000},
        {scale},
        {translateX},
        {rotateY: `${rotateY}deg`},
      ],
      borderRadius,
    };
  });
  const filteredEvents = filterEventsByCategoryAndLocation(
    eventList,
    selectedCategory,
    selectedCity,
    selectedDistrict,
  );

  const fetchEvents = async () => {
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
      setErrorMessage('Failed to load events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      fetchEvents();
    }, []),
  );

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
      );
      if (response.status === 200) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

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
        setErrorMessage('Failed to load events. Please try again later.');
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

  if (errorMessage) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red'}}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[
        {flex: 1, backgroundColor: '#f8f8f8', padding: 16},
        animatedStyle,
      ]}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={{padding: 10}}>
          <Ionicons name="menu-outline" size={28} color="#333" />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{color: '#777', fontSize: 16}}>Hi 👋</Text>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginLeft: 5}}>
            {user && user.firstName
              ? `${user.firstName} ${user.lastName}`
              : 'Guest'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('LocationScreen', {
              setSelectedCity,
              setSelectedDistrict,
            })
          }
          style={{padding: 10}}>
          <Ionicons name="location-outline" size={28} color="#333" />
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
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
          <Ionicons name="options-outline" size={20} color="#777" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{marginBottom: 20}}>
        {[
          {
            title: 'Concert',
            eventType: 'Concert',
            image: 'https://i.ibb.co/HFrRNQm/Yeni-Proje.png',
          },
          {
            title: 'Sport Events',
            eventType: 'Sports',
            image:
              'https://media.istockphoto.com/id/469569148/tr/foto%C4%9Fraf/soccer-fans-at-stadium.jpg?s=2048x2048&w=is&k=20&c=9lF6InxcOnYcJXsuYoFScnmtyrRrnXu3F21B5FRuEF4=',
          },
          {
            title: 'Theatre',
            eventType: 'Theatre',
            image:
              'https://images.pexels.com/photos/63328/wells-theatre-norfolk-virginian-seats-63328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
          },
        ].map((category, index) => (
          <Pressable
            key={index}
            onPress={() =>
              navigation.navigate('EventScreen', {category: category.eventType})
            }
            style={{marginRight: 10}}>
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
            onPress={() =>
              navigation.navigate('EventScreen', {item: popularEvent})
            }
            style={{borderRadius: 15, overflow: 'hidden'}}>
            <ImageBackground
              source={{
                uri:
                  popularEvent.organizerUrl ||
                  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqG-InngmdJ4Ifg1hcdSKJM9y9vdYIobP1Ya-1f10vV2yclcqd',
              }}
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
                  selectedCategory === category ? '#4A3D8A' : 'transparent',
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 15,
                marginRight: 10,
                borderColor:
                  selectedCategory === category ? '#4A3D8A' : '#e0e0e0',
                borderWidth: 1,
              }}>
              <Text
                style={{
                  color: selectedCategory === category ? 'white' : '#999',
                  fontWeight: selectedCategory === category ? 'bold' : 'normal',
                }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <Text style={{fontSize: 18, fontWeight: '700'}}>Popular</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Event')}>
            <Text style={{color: '#7b61ff', fontWeight: 'bold'}}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1}}>
          {filteredEvents.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredEvents.map(item => (
                <Pressable
                  key={item._id}
                  onPress={() => navigation.navigate('Event', {item})}
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
                      uri:
                        item.images && item.images.length > 0
                          ? item.images[0]
                          : 'https://via.placeholder.com/200',
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
      <AdsCarousel />

      {/* <View
        style={{
          flexDirection: 'row',
          backgroundColor: '#fff',
          borderRadius: 15,
          padding: 15,
          marginVertical: 20,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
            borderWidth: 2,
            borderColor: '#5c6bc0',
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
          onPress={() => navigation.navigate('CommunityScreen')}>
          <Ionicons
            name="people-outline"
            size={18}
            color="#5c6bc0"
            style={{marginRight: 8}}
          />
          <Text
            style={{
              color: '#5c6bc0',
              fontWeight: '600',
              fontSize: 16,
            }}>
            Community
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
            backgroundColor: '#ff7043',
            paddingVertical: 10,
            paddingHorizontal: 20,
          }}
          onPress={() => navigation.navigate('BecomeOrganizerScreen')}>
          <Ionicons
            name="person-add-outline"
            size={18}
            color="#fff"
            style={{marginRight: 8}}
          />
          <Text
            style={{
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
            }}>
            Organizer
          </Text>
        </TouchableOpacity>
      </View> */}

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
    </Animated.ScrollView>
  );
};

export default HomeScreen;
