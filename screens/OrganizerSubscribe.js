import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Linking} from 'react-native';

const API_BASE_URL = 'https://biletixai.onrender.com';

const OrganizerSubscribe = ({navigation}) => {
  const priceId = 'price_1Qjp1ZBMq2jPTvoIEnXqxV92';
  const userId = 'USER_ID_HERE'; // Kullanıcı ID'sini dinamik olarak al

  const handleSubscribe = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/create-checkout-session`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({priceId, userId}),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const {url} = await response.json();
      if (url) {
        Linking.openURL(url);
      } else {
        alert('Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Subscription Error:', error);
      alert('Something went wrong. Please try again.');
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

      <View style={[styles.planOption, styles.selectedPlan]}>
        <Ionicons name="checkmark-circle" size={20} color="white" />
        <View>
          <Text style={styles.planText}>Organizer Plus</Text>
          <Text style={styles.planDesc}>Full access to all features</Text>
        </View>
        <Text style={styles.planPrice}>$15.00 / Month</Text>
      </View>

      <Text style={styles.note}>No Commitment · Cancel anytime</Text>

      <TouchableOpacity
        style={styles.subscribeButton}
        onPress={handleSubscribe}>
        <Text style={styles.subscribeText}>Subscribe Now</Text>
      </TouchableOpacity>

      <Text style={styles.termsText}>
        By continuing, you agree to our{' '}
        <Text style={styles.linkText}>Terms of Service</Text> and{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What’s Included?</Text>

        {[
          'Unlimited Event Creation',
          "Your events will be featured under 'Recommended for You'",
          'Advertise Your Events',
          'Advanced Analytics & Reports',
          'Detailed Event Insights',
        ].map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark" size={20} color="green" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
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
  premiumSubtitle: {fontSize: 14, color: 'white'},
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAEAEA',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  selectedPlan: {backgroundColor: '#4CAF50'},
  planText: {fontSize: 16, fontWeight: 'bold', color: 'white'},
  planDesc: {fontSize: 12, color: 'white'},
  planPrice: {fontSize: 16, fontWeight: 'bold', color: 'white'},
  note: {fontSize: 14, color: 'gray', marginVertical: 10},
  subscribeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  subscribeText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  termsText: {fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 10},
  linkText: {color: '#007BFF', fontWeight: 'bold'},
});

export default OrganizerSubscribe;
