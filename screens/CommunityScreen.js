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
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {FadeIn, FadeOut, Layout} from 'react-native-reanimated';

const CommunityScreen = () => {
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    if (userId) {
      fetchCommunities();
      fetchUsers();
    } else {
      navigation.navigate('Login');
    }
  }, [userId]);

  // Toplulukları çek
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

  // Kullanıcı verilerini çek (profileImage için)
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://biletixai.onrender.com/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunities();
    await fetchUsers();
    setRefreshing(false);
  };

  const handleNavigation = communityId => {
    navigation.navigate('CommunityDetailScreen', {communityId});
  };

  const renderCommunityItem = ({item: community}) => {
    // İlk 5 katılımcıyı al
    const topAttendees = community.members.slice(0, 5);

    // Kullanıcıların profil resmini eşleştir
    const attendeeImages = topAttendees.map(attendeeId => {
      const user = users.find(u => u._id === attendeeId);
      return user ? user.profileImage : 'https://via.placeholder.com/40';
    });

    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        layout={Layout.springify()}>
        <Pressable
          onPress={() => handleNavigation(community._id)}
          style={styles.communityCard}>
          <Image
            style={styles.communityImage}
            source={{
              uri: community.profileImage || 'https://via.placeholder.com/100',
            }}
          />
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{community.name}</Text>
            <Text style={styles.communityDescription} numberOfLines={1}>
              {community.description}
            </Text>
            <Text style={styles.communityMembers}>
              {community.members.length} Attendees
            </Text>
          </View>

          {/* Katılımcıların küçük profil resimlerini göster */}
          <View style={styles.attendeeContainer}>
            {attendeeImages.map((image, index) => (
              <Image
                key={index}
                source={{uri: image}}
                style={[
                  styles.attendeeImage,
                  {marginLeft: index === 0 ? 0 : -10},
                ]}
              />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Üstte geri butonu */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communities</Text>
      </View>

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
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#EAEAEA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  communityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 15,
    marginRight: 12,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  communityMembers: {
    fontSize: 14,
    color: '#888',
  },
  attendeeContainer: {
    flexDirection: 'row',
  },
  attendeeImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CommunityScreen;
