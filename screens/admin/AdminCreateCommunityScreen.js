import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';
import {QUESTIONS} from '../../shared/questions.js';

const AdminCreateCommunityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {userId} = useContext(AuthContext);

  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [headerImage, setHeaderImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState(
    route.params?.selectedQuestions || [],
  );
  const [customQuestions, setCustomQuestions] = useState(
    route.params?.customQuestions || [],
  );

  useEffect(() => {
    if (route.params?.selectedQuestions) {
      setSelectedQuestions(route.params.selectedQuestions);
    }
    if (route.params?.customQuestions) {
      setCustomQuestions(route.params.customQuestions);
    }
  }, [route.params]);

  const pickImage = async setImage => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePrivateToggle = value => {
    setIsPrivate(value);
    if (value) {
      navigation.navigate('AddCustomQuestion', {
        selectedQuestions,
        setSelectedQuestions,
      });
    }
  };

  const handleCreateCommunity = async () => {
    const formattedQuestions = [...selectedQuestions, ...customQuestions];

    const communityData = {
      name: communityName.trim(),
      description: description.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPrivate,
      questions: isPrivate ? formattedQuestions : [],
      headerImage: headerImage || null,
      profileImage: profileImage || null,
      userId,
    };

    console.log(
      '📤 Sending communityData:',
      JSON.stringify(communityData, null, 2),
    );

    try {
      const response = await axios.post(
        'http://10.0.2.2:8000/communities',
        communityData,
        {
          headers: {'Content-Type': 'application/json'},
        },
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Community created successfully!');
        navigation.navigate('AdminDashboard');
      } else {
        Alert.alert(
          'Error',
          'Failed to create the community. Please try again.',
        );
      }
    } catch (error) {
      console.error(
        'Error creating community:',
        error.response?.data || error.message,
      );
      Alert.alert('Error', 'Failed to create the community. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={{fontSize: 28, fontWeight: 'bold', marginLeft: 10}}>
            Create Community
          </Text>
        </View>

        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickImage(setHeaderImage)}>
          <Text style={styles.imageButtonText}>Upload Header Image</Text>
          {headerImage && (
            <Image source={{uri: headerImage}} style={styles.imagePreview} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.imageButton}
          onPress={() => pickImage(setProfileImage)}>
          <Text style={styles.imageButtonText}>Upload Profile Image</Text>
          {profileImage && (
            <Image source={{uri: profileImage}} style={styles.imagePreview} />
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Community Name"
          value={communityName}
          onChangeText={setCommunityName}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[styles.input, {height: 100}]}
        />
        <TextInput
          placeholder="Tags (comma separated)"
          value={tags}
          onChangeText={setTags}
          style={styles.input}
        />

        <View style={styles.switchContainer}>
          <Text style={{fontSize: 16}}>Make Community Private</Text>
          <Switch
            value={isPrivate}
            onValueChange={handlePrivateToggle}
            style={{marginLeft: 10}}
          />
        </View>

        {isPrivate && selectedQuestions.length > 0 && (
          <View style={styles.questionContainer}>
            <Text style={styles.questionHeader}>Selected Questions:</Text>
            {selectedQuestions.map((q, index) => {
              const question = QUESTIONS.find(question => question.id === q.id);
              return question ? (
                <Text key={index} style={styles.questionText}>
                  - {question.text}
                </Text>
              ) : null;
            })}
          </View>
        )}

        <TouchableOpacity
          onPress={handleCreateCommunity}
          style={styles.createButton}>
          <Text style={styles.buttonText}>Create Community</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  imageButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {color: '#4a4a4a', fontSize: 16},
  imagePreview: {width: 100, height: 100, marginTop: 10, borderRadius: 10},
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  questionContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  questionHeader: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  questionText: {fontSize: 16, marginBottom: 5},
  createButton: {
    backgroundColor: '#07bc0c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontSize: 16},
  backButton: {marginRight: 10},
});

export default AdminCreateCommunityScreen;
