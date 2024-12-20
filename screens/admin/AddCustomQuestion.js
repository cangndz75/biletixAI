import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {Switch} from 'react-native-paper';

const AddCustomQuestion = ({route, navigation}) => {
  const {setCustomQuestions, customQuestions} = route.params;

  const [questions, setQuestions] = useState(customQuestions || []);
  const [newQuestions, setNewQuestions] = useState([createNewQuestion()]);

  function createNewQuestion() {
    return {
      title: '',
      isMultipleChoice: false,
      options: [],
      newOption: '',
    };
  }

  const handleAddAnotherQuestion = () => {
    setNewQuestions([...newQuestions, createNewQuestion()]);
  };

  const handleSaveAll = () => {
    const incompleteQuestion = newQuestions.find(q => !q.title);
    if (incompleteQuestion) {
      Alert.alert('Hata', 'Tüm sorular için başlık gereklidir.');
      return;
    }

    const formattedQuestions = newQuestions.map(q => ({
      text: q.title,
      type: q.isMultipleChoice ? 'multiple-choice' : 'text',
      options: q.isMultipleChoice ? q.options : [],
    }));

    setCustomQuestions([...questions, ...formattedQuestions]);
    Alert.alert('Başarılı', 'Sorular başarıyla kaydedildi!');
    navigation.goBack();
  };

  const handleOptionChange = (index, text) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index].newOption = text;
    setNewQuestions(updatedQuestions);
  };

  const handleAddOption = index => {
    const updatedQuestions = [...newQuestions];
    if (updatedQuestions[index].newOption.trim()) {
      updatedQuestions[index].options.push(
        updatedQuestions[index].newOption.trim(),
      );
      updatedQuestions[index].newOption = '';
      setNewQuestions(updatedQuestions);
    } else {
      Alert.alert('Hata', 'Seçenek eklemek için bir metin girin.');
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuestions];
    updatedQuestions[index][field] = value;
    setNewQuestions(updatedQuestions);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Add Custom Questions</Text>
        {newQuestions.map((question, index) => (
          <View key={index} style={styles.questionContainer}>
            <TextInput
              placeholder={`Question ${index + 1} Title`}
              value={question.title}
              onChangeText={text => handleQuestionChange(index, 'title', text)}
              style={styles.input}
            />
            <View style={styles.switchContainer}>
              <Text style={{fontSize: 16}}>Is Multiple Choice?</Text>
              <Switch
                value={question.isMultipleChoice}
                onValueChange={value =>
                  handleQuestionChange(index, 'isMultipleChoice', value)
                }
              />
            </View>
            {question.isMultipleChoice && (
              <View>
                <TextInput
                  placeholder="Add Option"
                  value={question.newOption}
                  onChangeText={text => handleOptionChange(index, text)}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => handleAddOption(index)}
                  style={styles.addButton}>
                  <Text style={styles.buttonText}>Add Option</Text>
                </TouchableOpacity>
                {question.options.map((option, optionIndex) => (
                  <Text key={optionIndex} style={styles.optionText}>
                    {optionIndex + 1}. {option}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}
        <TouchableOpacity
          onPress={handleAddAnotherQuestion}
          style={styles.addAnotherButton}>
          <Text style={styles.buttonText}>Add Another Question</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveAll} style={styles.saveButton}>
          <Text style={styles.buttonText}>Save All Questions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  questionContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  addAnotherButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  optionText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AddCustomQuestion;
