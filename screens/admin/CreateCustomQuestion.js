import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CreateCustomQuestion = ({navigation, route}) => {
  const {customQuestions, setCustomQuestions} = route.params;

  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const saveQuestion = () => {
    if (!newQuestion.trim()) {
      alert('Question text cannot be empty.');
      return;
    }

    const question = {
      text: newQuestion.trim(),
      type: questionType,
      options: questionType === 'multiple_choice' ? options : [],
    };

    setCustomQuestions([...customQuestions, question]);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Add New Question</Text>
      </View>

      <TextInput
        placeholder="Enter question text"
        value={newQuestion}
        onChangeText={setNewQuestion}
        style={styles.input}
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, questionType === 'text' && styles.activeTab]}
          onPress={() => setQuestionType('text')}>
          <Text
            style={[
              styles.tabText,
              questionType === 'text' && styles.activeTabText,
            ]}>
            Text
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            questionType === 'multiple_choice' && styles.activeTab,
          ]}
          onPress={() => setQuestionType('multiple_choice')}>
          <Text
            style={[
              styles.tabText,
              questionType === 'multiple_choice' && styles.activeTabText,
            ]}>
            Multiple Choice
          </Text>
        </TouchableOpacity>
      </View>

      {questionType === 'multiple_choice' && (
        <View>
          <View style={styles.optionInputContainer}>
            <TextInput
              placeholder="Add option"
              value={newOption}
              onChangeText={setNewOption}
              style={styles.optionInput}
            />
            <TouchableOpacity
              onPress={addOption}
              style={styles.addOptionButton}>
              <Ionicons name="add-circle-outline" size={32} color="white" />
            </TouchableOpacity>
          </View>

          {options.length > 0 && (
            <View>
              <Text style={styles.subtitle}>Options:</Text>
              {options.map((opt, index) => (
                <View key={index} style={styles.optionItem}>
                  <Text style={styles.optionText}>{opt}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      setOptions(options.filter((_, i) => i !== index))
                    }>
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={saveQuestion}>
        <Text style={styles.saveButtonText}>Save Question</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreateCustomQuestion;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#fff'},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#007bff',
  },
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addOptionButton: {
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 5,
  },
  optionText: {fontSize: 16},
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {color: 'white', fontSize: 16},
  optionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  addOptionButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
