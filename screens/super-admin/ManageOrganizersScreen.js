import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ManageOrganizersScreen = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await axios.get(
        'https://biletixai.onrender.com/organizers',
      );
      setOrganizers(response.data);
    } catch (error) {
      console.error('Error fetching organizers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async id => {
    try {
      await axios.post('https://biletixai.onrender.com/approveOrganizer', {
        id,
      });
      setOrganizers(prev =>
        prev.map(org => (org._id === id ? {...org, status: 'approved'} : org)),
      );
      Alert.alert('Success', 'Organizer approved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve organizer.');
    }
  };

  const handleRejectOrganizer = async id => {
    try {
      await axios.delete('https://biletixai.onrender.com/rejectOrganizer', {
        data: {id},
      });
      setOrganizers(prev => prev.filter(org => org._id !== id));
      Alert.alert('Removed', 'Organizer request rejected.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject organizer.');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <Image source={{uri: item.image}} style={styles.avatar} />
      <Text style={styles.cardTitle}>{item.firstName}</Text>
      <View style={styles.actions}>
        {item.status === 'pending' ? (
          <>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => handleApproveOrganizer(item._id)}>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectOrganizer(item._id)}>
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.approvedText}>✅ Approved</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>See Organizers</Text>

      <FlatList
        data={organizers}
        keyExtractor={item => item._id}
        renderItem={renderItem}
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
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  approveButton: {
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#D32F2F',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  approvedText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'grey',
    padding: 10,
    borderRadius: 50,
    zIndex: 1,
  },
});

export default ManageOrganizersScreen;
