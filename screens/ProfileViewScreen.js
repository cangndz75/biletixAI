import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthContext} from '../AuthContext';

const ProfileViewScreen = () => {
  const route = useRoute();
  const {userId} = route.params;
  const {userId: loggedInUserId} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('About');
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/user/${userId}`,
      );
      setUserData(response.data);
      setIsFollowing(
        response.data.followers?.includes(loggedInUserId) || false,
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowRequest = async () => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/user/follow`,
        {
          fromUserId: loggedInUserId,
          toUserId: userId,
        },
      );
      if (response.status === 200) {
        setIsFollowing(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user.');
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/user/unfollow`,
        {
          fromUserId: loggedInUserId,
          toUserId: userId,
        },
      );
      if (response.status === 200) {
        setIsFollowing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#07bc0c" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loader}>
        <Text>User not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.coverContainer}>
        <Image
          source={{uri: userData.image || 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
      </View>

      <View style={styles.card}>
        <Text
          style={
            styles.name
          }>{`${userData.firstName} ${userData.lastName}`}</Text>
        <Text style={styles.location}>
          @{userData.username} • {userData.location || 'Unknown'}
        </Text>

        <View style={styles.stats}>
          <Text style={styles.statText}>
            {userData.following?.length || 0} Following
          </Text>
          <Text style={styles.statText}>
            {userData.followers?.length || 0} Followers
          </Text>
        </View>

        {/* Kullanıcının Abonelik Tipini Kontrol Et */}
        {userData.subscriptionType === 'UserPlus' &&
          userId !== loggedInUserId && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={
                  isFollowing ? styles.unfollowButton : styles.followButton
                }
                onPress={isFollowing ? handleUnfollow : handleFollowRequest}>
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => navigation.navigate('ChatRoom', {userId})}>
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          )}

        <View style={styles.tabs}>
          <TouchableOpacity
            style={selectedTab === 'About' ? styles.activeTab : styles.tab}
            onPress={() => setSelectedTab('About')}>
            <Text style={styles.tabText}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={selectedTab === 'Event' ? styles.activeTab : styles.tab}
            onPress={() => setSelectedTab('Event')}>
            <Text style={styles.tabText}>Event</Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'About' ? (
          <View style={styles.aboutSection}>
            <Text>{userData.aboutMe || 'No information provided'}</Text>
          </View>
        ) : (
          <View style={styles.eventSection}>
            {userData.events?.length > 0 ? (
              userData.events.map(event => (
                <View key={event._id} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
              ))
            ) : (
              <Text>No events to display.</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginTop: -50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginTop: 10,
  },
  followButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  unfollowButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  followButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
  messageButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ProfileViewScreen;
