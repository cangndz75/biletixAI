import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StaffDetailsScreen = ({route, navigation}) => {
  const {staff} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [editedName, setEditedName] = useState(staff.name);
  const [editedRole, setEditedRole] = useState(staff.role);

  const handleSaveEdit = () => {
    Alert.alert('Updated', 'Staff details have been updated.');
    setModalVisible(false);
  };

  const handleDeleteStaff = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this staff?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert('Deleted', 'Staff member has been removed.');
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Geri Dön Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      {/* Profil Kartı */}
      <View style={styles.card}>
        <Ionicons
          name="person-circle"
          size={80}
          color="#007bff"
          style={styles.avatar}
        />
        <Text style={styles.name}>{staff.name}</Text>
        <Text style={styles.role}>{staff.role}</Text>
        <Text style={styles.email}>{staff.email}</Text>
      </View>

      {/* Görev Aldığı Etkinlikler */}
      <Text style={styles.sectionTitle}>Assigned Events</Text>
      <View style={styles.eventsContainer}>
        {staff.assignedEvents && staff.assignedEvents.length > 0 ? (
          staff.assignedEvents.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>📅 {event.date}</Text>
              <Text style={styles.eventLocation}>📍 {event.location}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEvents}>No assigned events.</Text>
        )}
      </View>

      {/* Yönetim Butonları */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteStaff}>
          <Ionicons name="trash" size={24} color="white" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>

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
              onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 18,
    color: '#555',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  eventsContainer: {
    marginBottom: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventLocation: {
    fontSize: 14,
    color: '#888',
  },
  noEvents: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    justifyContent: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '48%',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F4F6F9',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#007bff',
  },
});

export default StaffDetailsScreen;
