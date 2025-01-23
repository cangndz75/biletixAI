import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {QUESTIONS} from '../../shared/questions';

const AddCustomQuestion = ({navigation}) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);

  const predefinedQuestions = QUESTIONS;

  const toggleQuestionSelection = question => {
    if (selectedQuestions.some(q => q.id === question.id)) {
      setSelectedQuestions(selectedQuestions.filter(q => q.id !== question.id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const removeCustomQuestion = index => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    navigation.navigate('AdminCreateCommunity', {
      selectedQuestions,
      customQuestions,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Community Join Questions</Text>
      </View>

      <FlatList
        data={predefinedQuestions}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[
              styles.questionItem,
              selectedQuestions.some(q => q.id === item.id) && styles.selected,
            ]}
            onPress={() => toggleQuestionSelection(item)}>
            <Text style={styles.questionText}>{item.text}</Text>
            {selectedQuestions.some(q => q.id === item.id) ? (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            ) : (
              <Ionicons name="add-circle-outline" size={24} color="#888" />
            )}
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <View>
            <Text style={styles.subtitle}>Predefined Questions</Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('CreateCustomQuestion', {
            customQuestions,
            setCustomQuestions,
          })
        }>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Add Custom Question</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save and Continue</Text>
      </TouchableOpacity>

      {customQuestions.length > 0 && (
        <View style={styles.customQuestionsContainer}>
          <Text style={styles.subtitle}>Custom Questions:</Text>
          {customQuestions.map((q, index) => (
            <View key={index} style={styles.customQuestionCard}>
              <View style={styles.customQuestionTextContainer}>
                <Text style={styles.questionText}>{q.text}</Text>
                {q.type === 'multiple_choice' && (
                  <Text style={styles.optionsText}>{q.options.join(', ')}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => removeCustomQuestion(index)}
                style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={28} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default AddCustomQuestion;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  header: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  backButton: {marginRight: 10},
  title: {fontSize: 22, fontWeight: 'bold'},
  subtitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333'},
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
  },
  selected: {backgroundColor: '#d4edda'},
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {color: 'white', fontSize: 16, marginLeft: 5},
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {color: 'white', fontSize: 16},
  customQuestionsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 3,
  },
  customQuestionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 4,
  },
  customQuestionTextContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
