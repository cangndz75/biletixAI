import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const RegisterForm = () => {
  const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const images = [
    {id: '1', uri: 'https://cdn-icons-png.flaticon.com/128/16683/16683469.png'},
    {id: '2', uri: 'https://cdn-icons-png.flaticon.com/128/16683/16683439.png'},
    {id: '3', uri: 'https://cdn-icons-png.flaticon.com/128/4202/4202835.png'},
    {id: '4', uri: 'https://cdn-icons-png.flaticon.com/128/3079/3079652.png'},
  ];

  const handleRegister = async () => {
    if (!email || !password || !firstName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const userData = {
      email,
      password,
      firstName,
      lastName,
      image,
    };

    try {
      const response = await axios.post(
        'https://biletixai.onrender.com/register',
        userData,
      );
      if (response.data.message) {
        Alert.alert('Success', response.data.message);
        navigation.replace('Login');
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error.response?.data?.message || 'Something went wrong!',
      );
    }
  };

  const handleImageSelect = uri => {
    setImage(uri);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerText}>Register</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password *</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>First Name *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Profile Picture</Text>
        <Pressable
          style={styles.imageSelector}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.imageSelectorText}>
            {image ? 'Change Picture' : 'Add Picture'}
          </Text>
        </Pressable>
        {image && <Image source={{uri: image}} style={styles.selectedImage} />}
      </View>

      <Pressable style={styles.submitButton} onPress={handleRegister}>
        <Text style={styles.submitButtonText}>Register</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Profile Picture</Text>
            <FlatList
              data={images}
              keyExtractor={item => item.id}
              horizontal
              renderItem={({item}) => (
                <Pressable onPress={() => handleImageSelect(item.uri)}>
                  <Image source={{uri: item.uri}} style={styles.modalImage} />
                </Pressable>
              )}
            />
            <Pressable
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  imageSelector: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  imageSelectorText: {
    fontSize: 16,
    color: '#007BFF',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    alignSelf: 'center',
  },
  submitButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: 'green',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
