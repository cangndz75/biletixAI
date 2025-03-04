import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CommunityDetailScreen = () => {
  const [community, setCommunityDetail] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const {communityId} = route.params;
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    const fetchCommunityDetails = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/communities/${communityId}`,
        );
        const communityData = response.data;
        setCommunityDetail(communityData);

        const joined = communityData.members.some(
          member => member._id === userId,
        );
        setIsJoined(joined);

        const pending = communityData.joinRequests.some(
          req => req.userId === userId && req.status === 'pending',
        );
        setIsPending(pending);

        if (joined) {
          navigation.replace('PostScreen', {communityId});
        }
      } catch (error) {
        Alert.alert('Hata', 'Topluluk detayları bulunamadı.');
      }
    };

    fetchCommunityDetails();
  }, [communityId, userId, route.params?.refresh]);

  const joinCommunity = async () => {
    try {
      setLoadingRequest(true);
      const response = await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/join`,
        {userId},
      );

      if (response.status === 201) {
        Alert.alert('Başarılı', 'Başvuru gönderildi. Onay bekleniyor.');
        setIsPending(true);
      }
    } catch (error) {
      console.error('Katılım hatası:', error.message);
      Alert.alert('Hata', 'Katılım sırasında bir sorun oluştu.');
    } finally {
      setLoadingRequest(false);
    }
  };

  const cancelRequest = async () => {
    try {
      setLoadingRequest(true);
      const response = await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/cancel-request`,
        {userId},
      );

      if (response.status === 200) {
        Alert.alert('Başvuru iptal edildi.');
        setIsPending(false);
      }
    } catch (error) {
      console.error('İstek iptali sırasında hata:', error);
      Alert.alert('Hata', 'Başvuru iptal edilirken bir sorun oluştu.');
    } finally {
      setLoadingRequest(false);
    }
  };

  const joinCommunityWithQuestions = async () => {
    setLoadingJoin(true);
    navigation.navigate('JoinCommunityScreen', {communityId});
  };

  if (!community) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={{
            uri:
              community?.headerImage || 'https://via.placeholder.com/400x200',
          }}
          style={styles.headerImage}
        />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>{community.name}</Text>
          <Text style={styles.locationText}>
            {community.members.length} Members
          </Text>
        </View>
      </View>

      <View style={styles.organizerSection}>
        <Image
          source={{
            uri: community.organizer?.image || 'https://via.placeholder.com/50',
          }}
          style={styles.organizerImage}
        />
        <View style={styles.organizerInfo}>
          <Text style={styles.organizerName}>
            {community.organizer?.firstName} {community.organizer?.lastName}
          </Text>
          <Text style={styles.organizerRole}>Community Organizer</Text>
        </View>
      </View>

      <View style={styles.aboutSection}>
        <Text style={styles.aboutTitle}>About Community</Text>
        <Text style={styles.aboutText}>{community.description}</Text>
      </View>

      {isJoined ? (
        <Text style={styles.joinedText}>Topluluğa Katıldınız ✅</Text>
      ) : isPending ? (
        <TouchableOpacity
          style={styles.pendingButton}
          onPress={cancelRequest}
          disabled={loadingRequest}>
          {loadingRequest ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.pendingButtonText}>Request Sent - Cancel</Text>
          )}
        </TouchableOpacity>
      ) : community.isPrivate ? (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={joinCommunityWithQuestions}
          disabled={loadingJoin}>
          {loadingJoin ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>Soruları Cevapla ve Katıl</Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={joinCommunity}
          disabled={loadingRequest}>
          {loadingRequest ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>Katıl</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerContainer: {position: 'relative'},
  headerImage: {width: '100%', height: 250, resizeMode: 'cover'},
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 50,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  headerTitle: {fontSize: 28, fontWeight: 'bold', color: 'white'},
  locationText: {fontSize: 16, color: 'white'},

  organizerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    margin: 15,
  },
  organizerImage: {width: 50, height: 50, borderRadius: 25},
  organizerInfo: {marginLeft: 10},
  organizerName: {fontSize: 18, fontWeight: 'bold', color: '#333'},
  organizerRole: {fontSize: 14, color: '#777'},

  aboutSection: {marginBottom: 20, paddingHorizontal: 15},
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  aboutText: {fontSize: 14, color: '#555'},
  content: {padding: 20},
  profileInfo: {flexDirection: 'row', alignItems: 'center', marginBottom: 15},
  profileImage: {width: 80, height: 80, borderRadius: 40},
  profileDetails: {marginLeft: 15},
  name: {fontSize: 20, fontWeight: 'bold'},
  members: {color: 'gray', marginTop: 5},
  joinButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 15,
  },
  joinButtonText: {color: '#fff', fontWeight: 'bold'},
  pendingButton: {
    backgroundColor: 'gray',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  pendingButtonText: {color: '#fff', fontWeight: 'bold'},
  joinedText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'green',
    fontWeight: 'bold',
    marginVertical: 15,
  },
  description: {fontSize: 16, color: 'gray', marginVertical: 10},
});

export default CommunityDetailScreen;
