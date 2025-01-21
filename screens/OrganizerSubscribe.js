import React, {useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Linking} from 'react-native';
import {AuthContext} from '../AuthContext';

const API_BASE_URL = 'https://biletixai.onrender.com';

const OrganizerSubscribe = ({navigation}) => {
  const {userId} = useContext(AuthContext);
  const priceId = 'price_1Qjp1ZBMq2jPTvoIEnXqxV92';
  console.log('User ID:', userId);
  const handleSubscribe = async () => {
    if (!userId) {
      alert('❌ User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({priceId, userId}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ Network error: ${errorText}`);
      }

      const {url} = await response.json();
      if (url) {
        Linking.openURL(url);
      } else {
        alert('❌ Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(`Something went wrong: ${error.message}`);
    }
  };

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
