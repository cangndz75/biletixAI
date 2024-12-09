import React, {useState, useContext, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import UpComingEvent from '../components/UpComingEvent';
import FilterModal from '../components/FilterModal';

const EventScreen = () => {
  const {user} = useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.category || 'All',
  );
  const [searchQuery, setSearchQuery] = useState(
    route.params?.searchQuery || '',
  );
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  const categories = ['All', 'Sports', 'Music', 'Football'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://biletixai.onrender.com/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.eventType.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilters = Object.keys(appliedFilters).every(key =>
      event[key] ? appliedFilters[key].includes(event[key]) : true,
    );
    return matchesCategory && matchesQuery && matchesFilters;
  });

  const renderHeader = () => (
    <View style={{padding: 12, backgroundColor: '#7b61ff'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
          {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
        </Text>
        <Ionicons name="notifications-outline" size={24} color="white" />
      </View>

      <Pressable
        onPress={() => navigation.navigate('SearchScreen')}
        style={{
          marginTop: 15,
          backgroundColor: 'white',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}>
        <Ionicons name="search-outline" size={20} color="gray" />
        <TextInput
          placeholder="Search Event"
          style={{flex: 1, marginLeft: 10}}
          editable={false}
        />
        <Ionicons
          onPress={() => setFilterModalVisible(true)}
          name="filter-outline"
          size={24}
          color="#7b61ff"
        />
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{marginTop: 15, flexDirection: 'row'}}>
          {categories.map((category, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedCategory(category)}
              style={{
                backgroundColor:
                  selectedCategory === category ? '#ff6b6b' : '#ddd',
                borderRadius: 20,
                paddingHorizontal: 15,
                paddingVertical: 8,
                marginRight: 10,
              }}>
              <Text
                style={{
                  color: selectedCategory === category ? 'white' : '#000',
                }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  return (
    <>
      <FlatList
        ListHeaderComponent={
          <>
            {renderHeader()}
            <FilterModal
              visible={filterModalVisible}
              onClose={() => setFilterModalVisible(false)}
              onApply={filters => {
                setAppliedFilters(filters);
                setFilterModalVisible(false);
              }}
              onReset={() => {
                setAppliedFilters({});
                setFilterModalVisible(false);
              }}
            />
          </>
        }
        data={filteredEvents}
        renderItem={({item}) => <UpComingEvent item={item} />}
        keyExtractor={item => item._id}
      />
    </>
  );
};

export default EventScreen;
