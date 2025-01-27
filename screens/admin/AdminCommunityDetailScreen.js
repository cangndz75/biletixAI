import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {useRoute, useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminCommunityDetailScreen = () => {
  const [community, setCommunity] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const {communityId} = route.params;

  useEffect(() => {
    fetchCommunityDetails();
  }, [communityId]);

  const fetchCommunityDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `https://biletixai.onrender.com/communities/${communityId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      setCommunity(response.data);
    } catch (error) {
      console.error('Error fetching community details:', error.message);
      Alert.alert('Error', 'Failed to load community details.');
    }
  };

  const handleEdit = field => {
    setEditField(field);
    setEditValue(community[field] || '');
    setModalVisible(true);
  };

  const saveEdit = async () => {
    try {
      let updateUrl = `https://biletixai.onrender.com/communities/${communityId}`;

      if (editField === 'name') {
        updateUrl += '/name';
      } else if (editField === 'description') {
        updateUrl += '/description';
      }

      await axios.put(updateUrl, {[editField]: editValue});

      setModalVisible(false);
      fetchCommunityDetails(); 
    } catch (error) {
      console.error(
        'Error updating community:',
        error.response?.data || error.message,
      );
      Alert.alert('Error', 'Failed to update community.');
    }
  };
  if (!community) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{
          uri: community.headerImage || 'https://via.placeholder.com/400x200',
        }}
        style={styles.headerImage}
      />
      <View style={styles.profileContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Image
          source={{
            uri: community.profileImage || 'https://via.placeholder.com/100',
          }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.communityName}>{community.name}</Text>
          <Text style={styles.memberCount}>{community.members.length} Üye</Text>
        </View>
        <TouchableOpacity onPress={() => handleEdit('name')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.sectionContent}>{community.description}</Text>
        <TouchableOpacity onPress={() => handleEdit('description')}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editField}</Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={styles.modalInput}
              multiline
            />
            <TouchableOpacity onPress={saveEdit} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AdminCommunityDetailScreen;

const styles = StyleSheet.create({
  container: {paddingBottom: 20, backgroundColor: '#f4f4f4'},
  headerImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -50,
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
  },
  profileImage: {width: 80, height: 80, borderRadius: 40, marginRight: 15},
  infoContainer: {flex: 1},
  communityName: {fontSize: 24, fontWeight: 'bold'},
  memberCount: {color: 'gray', marginTop: 5},
  editText: {color: '#007bff', fontWeight: 'bold'},
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
  },
  sectionTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 5},
  sectionContent: {color: 'gray'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {fontSize: 18, fontWeight: 'bold', marginBottom: 10},
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {color: '#fff', fontWeight: 'bold'},
  cancelButton: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {color: 'black', fontWeight: 'bold'},
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 10,
  },
});
