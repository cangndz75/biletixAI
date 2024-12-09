import React, {useCallback, useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const CommunityScreen = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      fetchCommunities();
    } else {
      navigation.navigate('Login');
    }
  }, [userId]);

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'https://biletixai.onrender.com/communities',
      );
      setCommunities(response.data);
    } catch (error) {
      console.error('Error fetching communities:', error.message);
      Alert.alert('Error', 'Could not load communities.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunities();
    setRefreshing(false);
  };

  const handleNavigation = communityId => {
    navigation.navigate('CommunityDetailScreen', {communityId});
  };

  const renderCommunityItem = ({item: community}) => (
    <Pressable
      onPress={() => handleNavigation(community._id)}
      style={{
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          style={{width: 80, height: 80, borderRadius: 12, marginRight: 12}}
          source={{
            uri: community.profileImage || 'https://via.placeholder.com/100',
          }}
        />
        <View style={{flex: 1}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', color: '#333'}}>
            {community.name}
          </Text>
          <Text style={{fontSize: 14, color: '#777', marginVertical: 4}}>
            {community.membersCount} Üye
          </Text>
          {community.organizer && (
            <Text style={{fontSize: 14, color: '#999'}}>
              Organizator: {community.organizer.firstName}{' '}
              {community.organizer.lastName}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  return (
    <FlatList
      data={communities}
      renderItem={renderCommunityItem}
      keyExtractor={item => item._id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default CommunityScreen;
