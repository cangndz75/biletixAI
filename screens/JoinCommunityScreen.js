import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const JoinCommunityScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const {communityId} = route.params;
  const {userId} = useContext(AuthContext);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/communities/${communityId}`,
        );
        const communityData = response.data;

        if (communityData.questions) {
          setQuestions(communityData.questions);
          setAnswers(
            communityData.questions.reduce((acc, question) => {
              acc[question.text] = '';
              return acc;
            }, {}),
          );
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Hata', 'Sorular yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [communityId]);

  const submitAnswers = async () => {
    try {
      const response = await axios.post(
        `https://biletixai.onrender.com/communities/${communityId}/send-request`,
        {userId, answers},
      );

      if (response.status === 200) {
        Alert.alert('Başarılı', 'Başvuru gönderildi. Onay bekleniyor.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Başvuru gönderirken hata:', error.message);
      Alert.alert('Hata', 'Başvuru gönderilirken bir sorun oluştu.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Topluluğa Katıl</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      ) : questions.length === 0 ? (
        <Text style={styles.noQuestions}>
          Bu topluluk için özel sorular bulunmuyor.
        </Text>
      ) : (
        questions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>
            <TextInput
              placeholder="Cevabınızı yazın..."
              style={styles.input}
              multiline
              value={answers[question.text]}
              onChangeText={text =>
                setAnswers(prev => ({...prev, [question.text]: text}))
              }
            />
          </View>
        ))
      )}

      {!loading && questions.length > 0 && (
        <TouchableOpacity style={styles.submitButton} onPress={submitAnswers}>
          <Text style={styles.submitButtonText}>Gönder</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  backButton: {marginBottom: 20},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {marginTop: 10, fontSize: 16, color: 'gray'},
  noQuestions: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
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

export default JoinCommunityScreen;
