import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const BecomeOrganizerScreen = () => {
  const {userId} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState({
    fullName: false,
    email: false,
  });
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          `http://10.0.2.2:8000/user/${userId}`,
          {
            headers: {Authorization: `Bearer ${token}`},
          },
        );

        const user = response.data;
        setFormData({
          fullName: `${user.firstName} ${user.lastName}`,
          email: user.email,
          phone: '',
          reason: '',
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load user details.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (key, value) => {
    setFormData({...formData, [key]: value});
  };

  const handleSubmit = async () => {
    const {fullName, email, phone, reason} = formData;

    if (!fullName || !email || !reason) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `http://10.0.2.2:8000/beorganizator`,
        {
          email,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' '),
          phone,
          reason,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'You are now an organizer!');
      await AsyncStorage.removeItem('token');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit the form. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5c6bc0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Become an Organizer</Text>
      <Text style={styles.subtitle}>
        Fill out the form below to apply as an organizer.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.fullName}
          editable={editable.fullName}
          onChangeText={text => handleInputChange('fullName', text)}
        />
        <TouchableOpacity
          onPress={() =>
            setEditable(prev => ({...prev, fullName: !prev.fullName}))
          }>
          <Ionicons name="pencil" size={20} color="#5c6bc0" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          editable={editable.email}
          onChangeText={text => handleInputChange('email', text)}
        />
        <TouchableOpacity
          onPress={() => setEditable(prev => ({...prev, email: !prev.email}))}>
          <Ionicons name="pencil" size={20} color="#5c6bc0" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={formData.phone}
        keyboardType="phone-pad"
        onChangeText={text => handleInputChange('phone', text)}
      />
      <TextInput
        style={[styles.input, {height: 100}]}
        placeholder="Why do you want to become an organizer?"
        multiline
        value={formData.reason}
        onChangeText={text => handleInputChange('reason', text)}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BecomeOrganizerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#5c6bc0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
