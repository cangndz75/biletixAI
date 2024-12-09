import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  Linking,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BottomModal, SlideAnimation, ModalContent} from 'react-native-modals';
import {AuthContext} from '../AuthContext';

const CommunityDetailScreen = () => {
  const [community, setCommunityDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [answers, setAnswers] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    age: '',
    reason: '',
  });

  const navigation = useNavigation();
  const route = useRoute();
  const {communityId} = route.params;
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    if (!userId) {
      Alert.alert('Hata', 'Kullanıcı giriş yapmadı.');
      navigation.navigate('Login');
      return;
    }

    const fetchCommunityDetails = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/communities/${communityId}`,
        );
        const communityData = response.data;
        setCommunityDetail(communityData);

        const isMember = communityData.members.some(
          member => member._id === userId,
        );
        setIsJoined(isMember);
      } catch (error) {
        console.error('Error fetching community details:', error);
        Alert.alert('Hata', 'Topluluk detayları bulunamadı.');
      }
    };

    if (communityId) {
      fetchCommunityDetails();
    } else {
      Alert.alert('Hata', "Topluluk ID'si bulunamadı.");
    }
  }, [communityId, userId, navigation]);

  const joinCommunity = async () => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/join`,
        {userId, answers},
      );
      if (response.status === 200) {
        Alert.alert('Başarılı', 'Topluluğa başarıyla katıldınız!');
        setIsJoined(true);
      }
    } catch (error) {
      console.error('Topluluğa katılırken hata:', error.message);
      Alert.alert('Hata', 'Topluluğa katılırken bir sorun oluştu.');
    }
  };

  const submitAnswers = async () => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/send-request`,
        {userId, answers},
      );

      if (response.status === 200) {
        Alert.alert('Başarılı', 'Başvuru gönderildi. Onay bekleniyor.');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Başvuru gönderirken hata:', error.message);
      Alert.alert('Hata', 'Başvuru gönderilirken bir sorun oluştu.');
    }
  };

  if (!community) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri: community?.headerImage || 'https://via.placeholder.com/400x200',
        }}
        style={styles.headerImage}
      />

      <View style={styles.content}>
        <View style={styles.profileInfo}>
          <Image
            source={{
              uri: community.profileImage || 'https://via.placeholder.com/100',
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.name}>{community.name}</Text>
            <Text style={styles.members}>
              {community.membersCount} Katılımcı
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={
            isJoined
              ? null
              : community.isPrivate
              ? () => setModalVisible(true)
              : joinCommunity
          }
          disabled={isJoined}>
          <Text style={styles.joinButtonText}>
            {isJoined
              ? 'Katıldı'
              : community.isPrivate
              ? 'Soruları Cevapla ve Katıl'
              : 'Topluluğa Katıl'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.description}>{community.description}</Text>

        <BottomModal
          visible={modalVisible}
          onTouchOutside={() => setModalVisible(false)}
          modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
          <ModalContent style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Topluluğa Katıl</Text>
            {Object.keys(answers).map((key, index) => (
              <TextInput
                key={index}
                placeholder={key}
                value={answers[key]}
                onChangeText={text => setAnswers({...answers, [key]: text})}
                style={styles.input}
              />
            ))}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={submitAnswers}>
              <Text style={styles.submitButtonText}>Gönder</Text>
            </TouchableOpacity>
          </ModalContent>
        </BottomModal>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  headerImage: {width: '100%', height: 200},
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
  description: {fontSize: 16, color: 'gray', marginVertical: 10},
  modalContainer: {padding: 20, borderRadius: 10},
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 15},
  input: {borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10},
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {color: '#fff', fontWeight: 'bold'},
});

export default CommunityDetailScreen;
