import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ManageOrganizersScreen = () => {
  const [organizers, setOrganizers] = useState([
    {id: '1', name: 'John Doe', status: 'pending'},
    {id: '2', name: 'Jane Smith', status: 'approved'},
    {id: '3', name: 'Alice Brown', status: 'pending'},
  ]);

  const handleApprove = id => {
    setOrganizers(prev =>
      prev.map(org => (org.id === id ? {...org, status: 'approved'} : org)),
    );
    Alert.alert('Success', 'Organizer approved successfully!');
  };

  const handleReject = id => {
    setOrganizers(prev => prev.filter(org => org.id !== id));
    Alert.alert('Removed', 'Organizer request rejected.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Organizers</Text>

      <FlatList
        data={organizers}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.actions}>
              {item.status === 'pending' ? (
                <>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(item.id)}>
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Approve</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(item.id)}>
                    <Ionicons name="close-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.approvedText}>✅ Approved</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  approveButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectButton: {
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  approvedText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManageOrganizersScreen;
