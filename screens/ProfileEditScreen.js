import React, {useEffect, useState, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';

const ProfileEditScreen = () => {
  const { userId } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:8000/user/${userId}`);
      console.log('Fetched user data:', response.data);
      setUserData(response.data.user || response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    console.log('Updating user data:', userData); 
    try {
      const response = await axios.put(`http://10.0.2.2:8000/user/${userId}`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        country: userData.country || '',
      });
  
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.navigate('ProfileDetailScreen', { refresh: true }); 
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };
  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5c6bc0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {userData && (
          <>
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                source={{ uri: userData.image || 'https://via.placeholder.com/100' }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 10,
                  backgroundColor: '#5c6bc0',
                  borderRadius: 15,
                  padding: 5,
                }}>
                <Ionicons name="pencil" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.firstName}
                onChangeText={text => setUserData({ ...userData, firstName: text })}
                style={styles.input}
                placeholder="First Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.lastName}
                onChangeText={text => setUserData({ ...userData, lastName: text })}
                style={styles.input}
                placeholder="Last Name"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.email}
                onChangeText={text => setUserData({ ...userData, email: text })}
                style={styles.input}
                placeholder="Email"
              />
              <Ionicons name="mail-outline" size={20} color="#555" />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.password}
                onChangeText={text => setUserData({ ...userData, password: text })}
                style={styles.input}
                secureTextEntry
                placeholder="Password"
              />
              <MaterialIcons name="lock-outline" size={20} color="#555" />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.phone || ''}
                onChangeText={text => setUserData({ ...userData, phone: text })}
                style={styles.input}
                placeholder="Phone"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                value={userData.country || ''}
                onChangeText={text => setUserData({ ...userData, country: text })}
                style={styles.input}
                placeholder="Country"
              />
              <Ionicons name="chevron-down" size={20} color="#555" />
            </View>

            <TouchableOpacity
              onPress={handleUpdate}
              style={styles.updateButton}
              disabled={isUpdating}>
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#5c6bc0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

export default ProfileEditScreen;
