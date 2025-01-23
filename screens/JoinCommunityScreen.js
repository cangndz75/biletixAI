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
import {RadioButton} from 'react-native-paper';

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
              acc[question._id] = '';
              return acc;
            }, {}),
          );
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        Alert.alert('Error', 'An error occurred while loading questions.');
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
        Alert.alert(
          'Success',
          'Your request has been submitted. Waiting for approval.',
        );

        navigation.navigate('CommunityDetailScreen', {
          communityId,
          refresh: true,
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error.message);
      Alert.alert('Error', 'An issue occurred while submitting your request.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Join Community</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : questions.length === 0 ? (
        <Text style={styles.noQuestions}>
          There are no specific questions for this community.
        </Text>
      ) : (
        questions.map((question, index) => (
          <View key={question._id} style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.text}</Text>

            {question.type === 'multiple_choice' &&
            question.options?.length > 0 ? (
              question.options.map((option, idx) => (
                <View key={idx} style={styles.radioContainer}>
                  <RadioButton
                    value={option}
                    status={
                      answers[question._id] === option ? 'checked' : 'unchecked'
                    }
                    onPress={() =>
                      setAnswers(prev => ({...prev, [question._id]: option}))
                    }
                  />
                  <Text style={styles.radioText}>{option}</Text>
                </View>
              ))
            ) : (
              <TextInput
                placeholder="Write your answer..."
                style={styles.input}
                multiline
                value={answers[question._id]}
                onChangeText={text =>
                  setAnswers(prev => ({...prev, [question._id]: text}))
                }
              />
            )}
          </View>
        ))
      )}

      {!loading && questions.length > 0 && (
        <TouchableOpacity style={styles.submitButton} onPress={submitAnswers}>
          <Text style={styles.submitButtonText}>Submit</Text>
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
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  radioText: {
    fontSize: 14,
    marginLeft: 8,
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
