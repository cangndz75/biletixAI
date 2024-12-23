import React, {useContext, useState} from 'react';
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
  Modal,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';

const AdminCreateCommunityScreen = () => {
  const navigation = useNavigation();
  const {userId} = useContext(AuthContext); // Moved here to the main body

  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [headerImage, setHeaderImage] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [link, setLink] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);

  const basicQuestions = [
    {id: '1', text: 'Ad Soyad'},
    {id: '2', text: 'E-mail'},
    {id: '3', text: 'Telefon Numarası'},
    {id: '4', text: 'Yaş Aralığı'},
    {id: '5', text: 'Eğitim Durumu'},
    {id: '6', text: 'Meslek'},
    {id: '7', text: 'Katılma Sebebiniz'},
  ];

  const toggleQuestionSelection = question => {
    if (selectedQuestions.includes(question)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== question));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleDeleteQuestion = (index, isCustom) => {
    if (isCustom) {
      const updatedCustomQuestions = [...customQuestions];
      updatedCustomQuestions.splice(index, 1);
      setCustomQuestions(updatedCustomQuestions);
    } else {
      const updatedSelectedQuestions = [...selectedQuestions];
      updatedSelectedQuestions.splice(index, 1);
      setSelectedQuestions(updatedSelectedQuestions);
    }
  };

  const pickImage = async setImage => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      if (!communityName || !description) {
        Alert.alert('Hata', 'Topluluk adı ve açıklama gereklidir.');
        return;
      }

      const allQuestions = [...selectedQuestions, ...customQuestions];

      const communityData = {
        name: communityName.trim(),
        description: description.trim(),
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        isPrivate,
        joinQuestions: isPrivate ? allQuestions : [],
        headerImage,
        profileImage,
        link,
        organizer: userId, // Using userId directly from the context
      };

      const response = await axios.post(
        'https://biletixai.onrender.com/communities',
        communityData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        Alert.alert('Başarılı', 'Topluluk başarıyla oluşturuldu!');
        navigation.navigate('CommunityList');
      } else {
        Alert.alert('Hata', 'Topluluk oluşturulamadı. Tekrar deneyin.');
      }
    } catch (error) {
      console.error(
        'Topluluk oluşturma hatası:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Hata',
        error.response?.data?.message ||
          'Topluluk oluşturulamadı. Tekrar deneyin.',
      );
    }
  };

  const renderRightActions = (index, isCustom) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteQuestion(index, isCustom)}>
      <Text style={{color: 'white', fontWeight: 'bold'}}>Sil</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <Ionicons
            name="arrow-back"
            size={28}
            onPress={() => navigation.goBack()}
          />
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
        <TextInput
          placeholder="Link"
          value={link}
          onChangeText={setLink}
          style={styles.input}
        />

        <View style={styles.switchContainer}>
          <Text style={{fontSize: 16}}>Make Community Private</Text>
          <Switch
            value={isPrivate}
            onValueChange={value => {
              setIsPrivate(value);
              if (value) setModalVisible(true);
            }}
            style={{marginLeft: 10}}
          />
        </View>

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
  imageButtonText: {
    color: '#4a4a4a',
    fontSize: 16,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  createButton: {
    backgroundColor: '#07bc0c',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 5,
  },
});

export default AdminCreateCommunityScreen;
