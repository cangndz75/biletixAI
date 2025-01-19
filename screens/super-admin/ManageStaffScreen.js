import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const API_URL = 'https://biletixai.onrender.com/staffs';

const ManageStaffScreen = ({navigation}) => {
  const [staffList, setStaffList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      console.log('📌 Fetching staff members...');
      const response = await axios.get(API_URL);
      setStaffList(response.data || []);
      console.log(`✅ ${response.data.length} staff members loaded.`);
    } catch (error) {
      console.error('❌ Error fetching staff list:', error);
      Alert.alert('Error', 'Failed to fetch staff members.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`${API_URL}/remove`, {data: {id}});
      Alert.alert('Deleted', 'Staff member has been removed.');
      fetchStaffs();
    } catch (error) {
      console.error('❌ Error deleting staff:', error);
      Alert.alert('Error', 'Failed to remove staff.');
    }
  };

  const handleEdit = staff => {
    setSelectedStaff(staff);
    setEditedName(staff.firstName);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Full name cannot be empty.');
      return;
    }

    try {
      await axios.put(`${API_URL}/edit`, {
        id: selectedStaff._id,
        firstName: editedName,
      });

      Alert.alert('Updated', 'Staff member has been updated.');
      setModalVisible(false);
      fetchStaffs();
    } catch (error) {
      console.error('❌ Error updating staff:', error);
      Alert.alert('Error', 'Failed to update staff member.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Manage Staff</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : staffList.length === 0 ? (
        <Text style={styles.noStaffText}>No staff members found.</Text>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <Text style={styles.staffName}>{item.firstName}</Text>
                <Text style={styles.staffEmail}>{item.email}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item._id)}
                  style={styles.deleteButton}>
                  <Ionicons name="trash-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Staff</Text>

            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Full Name"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F9',
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
  staffCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  staffEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
  },
  cancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noStaffText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#6c757d',
  },
});

export default ManageStaffScreen;
