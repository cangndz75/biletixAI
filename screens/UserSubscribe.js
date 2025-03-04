import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Linking} from 'react-native';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const API_BASE_URL = 'https://biletixai.onrender.com';
const priceId = 'price_1QiMLuBMq2jPTvoIIdjpMcvB';

const UserSubscribe = () => {
  const {userId} = useContext(AuthContext);
  const navigation = useNavigation();
  const [subscriptionType, setSubscriptionType] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState(null);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/${userId}/subscription`,
      );

      if (response.status === 200) {
        const userData = response.data;
        setSubscriptionType(userData.subscriptionType);
        setStripeSubscriptionId(userData.stripeSubscriptionId);
        setIsSubscribed(userData.isSubscribed);
      }
    } catch (error) {
      console.error('Failed to fetch user subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (!loading && isSubscribed) {
      navigation.navigate('HomeScreen');
    }
  }, [isSubscribed, navigation, loading]);

  const handleSubscribe = async () => {
    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/create-checkout-session/user`,
        {priceId, userId},
      );

      if (response.data.url) {
        Linking.openURL(response.data.url);
      } else {
        alert('Payment URL could not be retrieved.');
      }
    } catch (error) {
      console.error('Subscription Error:', error);
      alert(`Something went wrong: ${error.message}`);
    }
  };

  const handleCancelSubscription = async () => {
    if (!stripeSubscriptionId) {
      alert('No active subscription found.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/cancel-subscription`, {
        subscriptionId: stripeSubscriptionId,
        userId,
      });

      setIsSubscribed(false);
      setSubscriptionType(null);
      alert('Subscription canceled successfully.');
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      alert('Error canceling subscription.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>User Plus Membership</Text>

      <View style={styles.premiumContainer}>
        <Ionicons name="diamond" size={30} color="white" />
        <Text style={styles.premiumTitle}>Join User Plus</Text>
        <Text style={styles.premiumSubtitle}>
          Unlock exclusive features for your experience
        </Text>
      </View>

      {!isSubscribed ? (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}>
          <Text style={styles.subscribeText}>Subscribe Now - $5 / Month</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancelSubscription}>
          <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
        </TouchableOpacity>
      )}

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>What’s Included?</Text>

        {[
          'Messaging',
          'Verified Badge',
          'View Event Participants',
          'See Events Your Friends Attended',
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
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  cancelButtonText: {color: 'white', fontSize: 18, fontWeight: 'bold'},
  featuresContainer: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserSubscribe;
