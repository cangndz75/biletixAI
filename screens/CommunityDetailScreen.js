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
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {BottomModal, SlideAnimation, ModalContent} from 'react-native-modals';
import {AuthContext} from '../AuthContext';

const CommunityDetailScreen = () => {
  const [community, setCommunityDetail] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
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

        if (communityData.joinQuestions) {
          setQuestions(communityData.joinQuestions);
          setAnswers(
            communityData.joinQuestions.reduce((acc, question) => {
              acc[question] = '';
              return acc;
            }, {}),
          );
        }
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
              : () => Alert.alert('Topluluğa katılım başarıyla sağlandı.')
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

        {/* Modal for answering questions */}
        <BottomModal
          visible={modalVisible}
          onTouchOutside={() => setModalVisible(false)}
          modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
          <ModalContent style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Topluluğa Katıl</Text>
            <ScrollView style={styles.modalScroll}>
              {questions.map((question, index) => (
                <View key={index} style={styles.questionContainer}>
                  <Text style={styles.questionText}>{question}</Text>
                  <TextInput
                    placeholder="Cevabınızı yazın..."
                    style={styles.input}
                    multiline
                    value={answers[question]}
                    onChangeText={text =>
                      setAnswers(prev => ({...prev, [question]: text}))
                    }
                  />
                </View>
              ))}
            </ScrollView>
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
  modalContainer: {padding: 20, borderRadius: 10, maxHeight: '80%'},
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 15},
  modalScroll: {maxHeight: '60%'},
  questionContainer: {marginBottom: 15},
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
});

export default CommunityDetailScreen;
