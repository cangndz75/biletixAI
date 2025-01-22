import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Linking} from 'react-native';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';

const API_BASE_URL = 'https://biletixai.onrender.com';

const OrganizerSubscribe = () => {
  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();
  const priceId = 'price_1Qjp1ZBMq2jPTvoIEnXqxV92';
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/create-checkout-session/organizer`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({priceId, userId}),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      const {url} = await response.json();
      if (url) {
        Linking.openURL(url);
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 5000);
      } else {
        alert('Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(`Something went wrong: ${error.message}`);
    }
  };

  useEffect(() => {
    if (showSuccessModal) {
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('HomeScreen');
      }, 3000);
    }
  }, [showSuccessModal]);

  useEffect(() => {
    if (showSuccessModal) {
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('HomeScreen');
      }, 3000);
    }
  }, [showSuccessModal]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Organizer Plus Membership</Text>

      <View style={styles.premiumContainer}>
        <Ionicons name="diamond" size={30} color="white" />
        <Text style={styles.premiumTitle}>Join Organizer Plus</Text>
        <Text style={styles.premiumSubtitle}>
          Unlock powerful tools for your events
        </Text>
      </View>

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}>
        <Text style={styles.subscribeText}>Subscribe Now - $15.00 / Month</Text>
      </TouchableOpacity>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={50} color="green" />
            <Text style={styles.modalTitle}>Payment Success</Text>
            <Text>Your Organizer Plus subscription is active!</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => navigation.navigate('HomeScreen')}>
              <Text style={styles.modalButtonText}>Go to Homepage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F8F8',
    padding: 20,
    alignItems: 'center',
  },
  backButton: {alignSelf: 'flex-start'},
  headerTitle: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
  premiumContainer: {
    backgroundColor: '#6200EE',
    width: '100%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  subscribeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  subscribeText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
});

export default OrganizerSubscribe;
