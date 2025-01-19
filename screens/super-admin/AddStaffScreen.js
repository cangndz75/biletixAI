import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'https://biletixai.onrender.com/users';

const AddStaffScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${API_URL}/staffs`);
      setStaffList(response.data || []);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'All fields are required!');
      return;
    }

    try {
      await axios.post(`${API_URL}/staffs/add`, { firstName: name, email });
      Alert.alert('Success', `${name} has been added as Staff!`);
      setName('');
      setEmail('');
      fetchStaffs();
    } catch (error) {
      console.error('Error adding staff:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add staff.');
    }
  };

  const handleRemoveStaff = async (id) => {
    try {
      await axios.delete(`${API_URL}/staffs/remove`, { data: { id } });
      Alert.alert('Removed', 'Staff role has been removed.');
      fetchStaffs();
    } catch (error) {
      console.error('Error removing staff:', error);
      Alert.alert('Error', 'Failed to remove staff.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Add New Staff</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAddStaff}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Save Staff</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.manageButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="people" size={24} color="white" />
        <Text style={styles.buttonText}>Manage Staffs</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Manage Staffs</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : staffList.length === 0 ? (
            <Text style={styles.noStaffText}>No staff members found.</Text>
          ) : (
            <FlatList
              data={staffList}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.staffCard}>
                  <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/50' }}
                    style={styles.avatar}
                  />
                  <Text style={styles.staffName}>{item.firstName}</Text>
                  <TouchableOpacity onPress={() => handleRemoveStaff(item._id)}>
                    <Ionicons name="trash" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },
  backButton: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  manageButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6F00',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  staffCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddStaffScreen;
