import React, {useState, useContext, useEffect} from 'react';
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

const API_BASE_URL = 'https://biletixai.onrender.com';

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

  const categories = [
    'All',
    'Concert',
    'Sports',
    'Music',
    'Theatre',
    'Football',
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/events`);
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
    <View style={{padding: 12, backgroundColor: '#F5F5F5'}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Pressable onPress={() => navigation.goBack()} style={{padding: 8}}>
          <Ionicons name="arrow-back-outline" size={24} color="#444" />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate('SearchScreen')}
          style={{
            flex: 1,
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            elevation: 3,
          }}>
          {/* <Ionicons name="search-outline" size={20} color="#888" /> */}
          <TextInput
            placeholder="Search Event"
            style={{flex: 1, marginLeft: 10}}
            editable={false}
          />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{marginTop: 15, flexDirection: 'row'}}>
          {categories.map((category, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedCategory(category)}
              style={{
                backgroundColor:
                  selectedCategory === category ? '#FF6B6B' : '#E0E0E0',
                borderRadius: 20,
                paddingHorizontal: 15,
                paddingVertical: 8,
                marginRight: 10,
              }}>
              <Text
                style={{
                  color: selectedCategory === category ? '#fff' : '#333',
                }}>
                {category}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#FAFAFA'}}>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <>
          <FlatList
            ListHeaderComponent={renderHeader}
            data={filteredEvents}
            numColumns={2}
            keyExtractor={item => item._id}
            renderItem={({item}) => <UpComingEvent item={item} />}
            columnWrapperStyle={{
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}
            ListEmptyComponent={
              <View style={{alignItems: 'center', marginTop: 50}}>
                <Ionicons name="calendar-outline" size={48} color="#888" />
                <Text style={{fontSize: 18, color: '#888', marginTop: 8}}>
                  No Events Available
                </Text>
              </View>
            }
          />
        </>
      )}

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={filters => {
          setAppliedFilters(filters);
          setFilterModalVisible(false);
        }}
        onReset={() => {
          setAppliedFilters({});
          fetchEvents();
          setFilterModalVisible(false);
        }}
      />
    </View>
  );
};

export default EventScreen;
