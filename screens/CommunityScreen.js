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
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated';

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
      navigation.navigate('CommunityDetailScreen', {communityId});
    }
  };

  const renderCommunityItem = ({item: community}) => (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}>
      <Pressable
        onPress={() => handleNavigation(community._id)}
        style={styles.communityItem}>
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
              Organizatör: {community.organizer.firstName}{' '}
              {community.organizer.lastName}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#888" />
      </Pressable>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
      </Animated.View>

      <FlatList
        data={communities}
        renderItem={renderCommunityItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F7F7'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 40,
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
    marginVertical: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
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
    marginVertical: 2,
  },
  communityOrganizer: {
    fontSize: 14,
    color: '#999',
  },
});

export default CommunityScreen;
