import React, {useState, useEffect} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'https://biletixai.onrender.com/users';

const AddStaffScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [image, setImage] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const images = [
    {id: '1', uri: 'https://cdn-icons-png.flaticon.com/128/16683/16683469.png'},
    {id: '2', uri: 'https://cdn-icons-png.flaticon.com/128/16683/16683439.png'},
    {id: '3', uri: 'https://cdn-icons-png.flaticon.com/128/4202/4202835.png'},
    {id: '4', uri: 'https://cdn-icons-png.flaticon.com/128/3079/3079652.png'},
  ];

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${API_URL}?role=staff`);
      setStaffList(response.data || []);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!email || !firstName) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      await axios.post(`${API_URL}/register`, {
        firstName,
        email,
        password: 'default123',
        image: image || 'https://via.placeholder.com/100',
        role: 'staff',
      });

      Alert.alert('Success', `${firstName} has been added as Staff!`);
      setFirstName('');
      setEmail('');
      setImage(null);
      fetchStaffs();
    } catch (error) {
      console.error('Error adding staff:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to add staff.',
      );
    }
  };

  const handleRemoveStaff = async id => {
    try {
      await axios.delete(`${API_URL}/remove`, {data: {id}});
      Alert.alert('Removed', 'Staff role has been removed.');
      fetchStaffs();
    } catch (error) {
      console.error('Error removing staff:', error);
      Alert.alert('Error', 'Failed to remove staff.');
    }
  };

  const handleImageSelect = uri => {
    setImage(uri);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </Pressable>

      <Text style={styles.headerText}>Add New Staff</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter full name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
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

      <Pressable style={styles.submitButton} onPress={handleAddStaff}>
        <Text style={styles.submitButtonText}>Save Staff</Text>
      </Pressable>

      <Pressable
        style={styles.manageButton}
        onPress={() => navigation.navigate('ManageStaffScreen')}>
        <Ionicons name="people" size={24} color="white" />
        <Text style={styles.buttonText}>Manage Staff</Text>
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

export default AddStaffScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 15,
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
  manageButton: {
    backgroundColor: '#FF6F00',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
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
});
