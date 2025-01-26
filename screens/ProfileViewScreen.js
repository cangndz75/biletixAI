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
import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ProfileViewScreen = () => {
  const route = useRoute();
  const {userId} = route.params;
  const {userId: loggedInUserId} = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('About');
  const navigation = useNavigation();
  const isOrganizer = userData?.role === 'organizer';

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
      await axios.post('https://biletixai.onrender.com/user/follow', {
        fromUserId: loggedInUserId,
        toUserId: userId,
      });
      setIsFollowing(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to follow user.');
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post('https://biletixai.onrender.com/user/unfollow', {
        fromUserId: loggedInUserId,
        toUserId: userId,
      });
      setIsFollowing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to unfollow user.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7C3AED" />
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.profileCard}>
        <Image
          source={{uri: userData.image || 'https://via.placeholder.com/100'}}
          style={styles.profileImage}
        />
        <Text style={styles.name}>
          {`${userData.firstName} ${userData.lastName}`}{' '}
          {userData.vipBadge && <Ionicons name="star" size={18} color="gold" />}
        </Text>
        <Text style={styles.username}>{userData.email}</Text>

        {userData.isPrivate ? (
          <View style={styles.privateContainer}>
            <Ionicons name="lock-closed" size={20} color="#666" />
            <Text style={styles.privateText}>This Account is Private</Text>
          </View>
        ) : (
          <>
            <View style={styles.stats}>
              <Text style={styles.statText}>
                {userData.followers?.length || 0} Followers
              </Text>
              <Text style={styles.statText}>
                {userData.following?.length || 0} Following
              </Text>
            </View>

            {loggedInUserId &&
              userData.isPrivate === false &&
              userData.vipBadge && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={
                      isFollowing ? styles.unfollowButton : styles.followButton
                    }
                    onPress={
                      isFollowing ? handleUnfollow : handleFollowRequest
                    }>
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
          </>
        )}
      </View>

      {!userData.isPrivate && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginVertical: 10,
          }}>
          {[
            'About',
            'Events',
            ...(userData.role !== 'organizer' && userData.role !== 'super_admin'
              ? ['Reviews']
              : []),
          ].map(tab => (
            <TouchableOpacity
              key={tab}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderBottomWidth: selectedTab === tab ? 2 : 0,
                borderBottomColor: '#7C3AED',
              }}
              onPress={() => setSelectedTab(tab)}>
              <Text style={{fontSize: 16, fontWeight: '600'}}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!userData.isPrivate && (
        <View style={styles.tabContent}>
          {selectedTab === 'About' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>About Me</Text>
              <Text style={styles.aboutText}>
                {userData.aboutMe || 'No information available'}
              </Text>
            </View>
          )}
          {selectedTab === 'Interest' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Interests</Text>
              <View style={styles.interestsContainer}>
                {userData.interests?.length > 0 ? (
                  userData.interests.map((interest, index) => (
                    <Text key={index} style={styles.interestTag}>
                      {interest}
                    </Text>
                  ))
                ) : (
                  <Text>No interests available.</Text>
                )}
              </View>
            </View>
          )}
          {selectedTab === 'Events' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upcoming Events</Text>
              {userData.events?.length > 0 ? (
                userData.events.map((event, index) => (
                  <View key={index} style={styles.eventCard}>
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
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5'},
  profileContainer: {
    backgroundColor: 'white',
    width: '90%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {fontSize: 20, fontWeight: 'bold', marginTop: 10},
  username: {fontSize: 16, color: 'gray', marginBottom: 10},
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 15,
  },
  statText: {fontSize: 14, color: '#555'},
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  tab: {paddingVertical: 10, paddingHorizontal: 20},
  activeTab: {borderBottomWidth: 2, borderBottomColor: '#7C3AED'},
  tabText: {fontSize: 16, fontWeight: '600'},
  tabContent: {padding: 20},
  privateContainer: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  privateText: {marginLeft: 5, fontSize: 16, color: '#666'},
  vipBadge: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  vipText: {color: 'gold', fontWeight: 'bold', marginLeft: 5},
  cardTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  interestsContainer: {flexDirection: 'row', flexWrap: 'wrap'},
  interestTag: {
    backgroundColor: '#E0E0E0',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  followButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
  unfollowButton: {
    backgroundColor: '#E63946',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 5,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 5,
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  interestTag: {
    backgroundColor: '#EFEFEF',
    padding: 8,
    borderRadius: 15,
    margin: 5,
  },
  eventCard: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
});

export default ProfileViewScreen;
