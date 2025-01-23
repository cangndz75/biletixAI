import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const API_BASE_URL = 'https://biletixai.onrender.com';

const BecomeOrganizerScreen = () => {
  const {userId} = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
          headers: {Authorization: `Bearer ${token}`},
        });

        const user = response.data;
        if (user.role === 'organizer') {
          Alert.alert('Info', 'You are already an organizer.');
          navigation.navigate('HomeScreen');
        } else {
          setFormData({
            fullName: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: '',
            reason: '',
          });
        }
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

    if (!reason) {
      Alert.alert(
        'Error',
        'Please explain why you want to become an organizer.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/beorganizator`,
        {
          firstName: fullName.split(' ')[0],
          email,
          phone,
          reason,
        },
        {headers: {Authorization: `Bearer ${token}`}},
      );

      Alert.alert('Success', 'Your application has been submitted for review.');
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', 'Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Become an Organizer</Text>
        <Text style={styles.subtitle}>
          Fill out the form below to apply as an organizer.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-circle" size={24} color="#666" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Full Name"
            value={formData.fullName}
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={24} color="#666" />
          <TextInput
            style={[styles.input, styles.disabledInput]}
            placeholder="Email"
            value={formData.email || ''} 
            editable={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call" size={24} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            keyboardType="phone-pad"
            onChangeText={text => handleInputChange('phone', text)}
          />
        </View>

        <View style={[styles.inputContainer, styles.multilineContainer]}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#666" />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Why do you want to become an organizer?"
            multiline
            value={formData.reason}
            onChangeText={text => handleInputChange('reason', text)}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default BecomeOrganizerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
  },
  title: {
    fontSize: 26,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    paddingLeft: 10,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#5c6bc0',
    padding: 15,
    borderRadius: 10,
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
