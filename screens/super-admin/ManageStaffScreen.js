import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ManageStaffScreen = ({navigation}) => {
  const [staffList, setStaffList] = useState([
    {
      id: '1',
      name: 'John Doe',
      role: 'Event Manager',
      email: 'john@example.com',
    },
    {id: '2', name: 'Jane Smith', role: 'Security', email: 'jane@example.com'},
    {
      id: '3',
      name: 'Alice Brown',
      role: 'Coordinator',
      email: 'alice@example.com',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedRole, setEditedRole] = useState('');

  const handleDelete = id => {
    setStaffList(prev => prev.filter(staff => staff.id !== id));
    Alert.alert('Deleted', 'Staff member has been removed.');
  };

  const handleEdit = staff => {
    setSelectedStaff(staff);
    setEditedName(staff.name);
    setEditedRole(staff.role);
    setModalVisible(true);
  };

  const handleSaveEdit = () => {
    setStaffList(prev =>
      prev.map(staff =>
        staff.id === selectedStaff.id
          ? {...staff, name: editedName, role: editedRole}
          : staff,
      ),
    );
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Manage Staff</Text>

      <FlatList
        data={staffList}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.staffCard}
            onPress={() =>
              navigation.navigate('StaffDetailsScreen', {staff: item})
            }>
            <View style={styles.staffInfo}>
              <Text style={styles.staffName}>{item.name}</Text>
              <Text style={styles.staffRole}>{item.role}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handleEdit(item)}
                style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Edit Modal */}
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
            <TextInput
              style={styles.input}
              value={editedRole}
              onChangeText={setEditedRole}
              placeholder="Role"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEdit}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setModalVisible(false);
                navigation.goBack();
              }}>
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
  staffRole: {
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
});

export default ManageStaffScreen;
