import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

  const handleNavigation = async communityId => {
    try {
      const userResponse = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
      );
      const userData = userResponse.data;

      const isJoined =
        userData.community && userData.community.includes(communityId);
      if (isJoined) {
        navigation.navigate('PostScreen', {communityId});
      } else {
        navigation.navigate('CommunityDetailScreen', {communityId});
      }
    } catch (error) {
      console.error('Error checking user membership:', error);
      navigation.navigate('CommunityDetailScreen', {communityId});
    }
  };

  const renderCommunityItem = ({item: community}) => (
    <Pressable
      onPress={() => handleNavigation(community._id)}
      style={styles.communityItem}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          style={styles.communityImage}
          source={{
            uri: community.profileImage || 'https://via.placeholder.com/100',
          }}
        />
        <View style={{flex: 1}}>
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.communityMembers}>
            {community.members.length} Üye
          </Text>
          {community.organizer && (
            <Text style={styles.communityOrganizer}>
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      {/* Üst Bar - Geri Butonu ve Başlık */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
      </View>

      {/* FlatList içinde artık geri butonu çakışmıyor */}
      <FlatList
        data={communities}
        renderItem={renderCommunityItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40, // Butonla hizalamak için
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  communityItem: {
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
  },
  communityImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  communityMembers: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  communityOrganizer: {
    fontSize: 14,
    color: '#999',
  },
});

export default CommunityScreen;
