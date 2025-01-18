import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useRoute, useNavigation} from '@react-navigation/native';

const AdminManageCommunityScreen = () => {
  const [requests, setRequests] = useState([]);
  const route = useRoute();
  const {communityId} = route.params;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchJoinRequests = async () => {
      const token = await AsyncStorage.getItem('token');
      try {
        const response = await axios.get(
          `http://10.0.2.2:8000/communities/${communityId}/requests`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );
        setRequests(response.data);
      } catch (error) {
        console.error('İstekleri çekerken hata:', error);
      }
    };

    fetchJoinRequests();
  }, [communityId]);

  const handleApproveRequest = async requestId => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/accept-request`,
        {requestId},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? {...req, status: 'accepted'} : req,
        ),
      );
      Alert.alert('Başarılı', 'İstek onaylandı.');
    } catch (error) {
      console.error('İstek onaylarken hata:', error.message);
      Alert.alert('Hata', 'İstek onaylanamadı.');
    }
  };

  const handleRejectRequest = async requestId => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/reject-request`,
        {requestId},
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? {...req, status: 'rejected'} : req,
        ),
      );
      Alert.alert('Başarılı', 'İstek reddedildi.');
    } catch (error) {
      console.error('İstek reddederken hata:', error.message);
      Alert.alert('Hata', 'İstek reddedilemedi.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.goBack}>
        <Text style={styles.goBackText}>Geri Dön</Text>
      </TouchableOpacity>

      {requests.length === 0 ? (
        <Text style={styles.noRequests}>Henüz bir istek bulunmamaktadır.</Text>
      ) : (
        requests.map(request => (
          <View key={request._id} style={styles.requestCard}>
            <Text style={styles.userName}>
              {request.userId.firstName} {request.userId.lastName}
            </Text>
            <Text style={styles.status}>Durum: {request.status}</Text>

            <Text style={styles.answerHeader}>Cevaplar:</Text>
            {request.answers.length > 0 ? (
              request.answers.map((answer, idx) => (
                <View key={idx} style={styles.answerContainer}>
                  <Text style={styles.questionText}>
                    Soru: {answer.questionText}
                  </Text>
                  <Text style={styles.answerText}>Cevap: {answer.answer}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noAnswers}>Henüz cevap yok.</Text>
            )}

            {request.status === 'pending' && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleApproveRequest(request._id)}
                  style={[styles.actionButton, styles.approveButton]}>
                  <Text style={styles.buttonText}>Onayla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRejectRequest(request._id)}
                  style={[styles.actionButton, styles.rejectButton]}>
                  <Text style={styles.buttonText}>Reddet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  goBack: {
    marginBottom: 10,
  },
  goBackText: {
    color: '#007bff',
    fontSize: 16,
  },
  noRequests: {
    textAlign: 'center',
    color: 'gray',
    marginTop: 20,
  },
  requestCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    color: 'gray',
    marginBottom: 5,
  },
  answerHeader: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  answerContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginTop: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    elevation: 1,
  },
  questionText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  noAnswers: {
    fontStyle: 'italic',
    color: 'gray',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default AdminManageCommunityScreen;
