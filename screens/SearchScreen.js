import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, ScrollView, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const categories = [
  'All',
  'Concert',
  'Conference',
  'Football',
  'Music',
  'Theatre',
  'Sports',
  'Software',
];

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigation = useNavigation();

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const searches = await AsyncStorage.getItem('recentSearches');
      if (searches) setRecentSearches(JSON.parse(searches));
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim() === '') return;

    try {
      const updatedSearches = [searchQuery, ...recentSearches].slice(0, 3);
      await AsyncStorage.setItem(
        'recentSearches',
        JSON.stringify(updatedSearches),
      );
      setRecentSearches(updatedSearches);
      navigation.navigate('EventScreen', {
        searchQuery,
        category: selectedCategory,
      });
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleCategoryPress = category => {
    setSelectedCategory(category);
    navigation.navigate('EventScreen', {category});
  };

  const removeSearch = async searchToRemove => {
    const updatedSearches = recentSearches.filter(
      item => item !== searchToRemove,
    );
    setRecentSearches(updatedSearches);
    await AsyncStorage.setItem(
      'recentSearches',
      JSON.stringify(updatedSearches),
    );
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#000', padding: 16}}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 10,
            color: 'white',
            borderBottomWidth: 1,
            borderColor: 'gray',
          }}
          placeholder="Search Events..."
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <View style={{marginTop: 20}}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Latest Search
        </Text>
        {recentSearches.length === 0 ? (
          <Text style={{color: 'gray', marginTop: 10}}>
            No recent searches.
          </Text>
        ) : (
          recentSearches.map((search, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <Ionicons name="time-outline" size={20} color="white" />
              <Pressable
                style={{flex: 1, marginLeft: 10}}
                onPress={() =>
                  navigation.navigate('EventScreen', {searchQuery: search})
                }>
                <Text style={{color: 'white'}}>{search}</Text>
              </Pressable>
              <Ionicons
                name="close-circle"
                size={20}
                color="red"
                onPress={() => removeSearch(search)}
              />
            </View>
          ))
        )}
      </View>

      <View style={{marginTop: 20}}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>
          Categories
        </Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', marginTop: 10}}>
          {categories.map((category, index) => (
            <Pressable
              key={index}
              onPress={() => handleCategoryPress(category)}
              style={{
                backgroundColor:
                  selectedCategory === category ? '#FF6B6B' : '#333',
                borderRadius: 20,
                paddingHorizontal: 15,
                paddingVertical: 8,
                margin: 5,
              }}>
              <Text style={{color: 'white'}}>{category}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default SearchScreen;
