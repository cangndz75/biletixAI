import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
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
  const [isReturningFromPayment, setIsReturningFromPayment] = useState(false);

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
        setIsReturningFromPayment(true);
        Linking.openURL(url);
      } else {
        alert('Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(`Something went wrong: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isReturningFromPayment) {
      setTimeout(() => {
        setShowSuccessModal(true);
      }, 3000);
    }
  }, [isReturningFromPayment]);

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

      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
              }}
              style={styles.successIcon}
            />
            <Text style={styles.modalTitle}>Payment Success</Text>
            <Text style={styles.modalText}>
              Your Organizer Plus subscription is now active! Enjoy exclusive
              features.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                navigation.navigate('AdminDashboard');
              }}>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrganizerSubscribe;
