import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const OrganizerSubscribe = ({navigation}) => {
  const [selectedPlan, setSelectedPlan] = useState('weekly');

  const handleSubscribe = () => {
    alert(`You have selected the ${selectedPlan} plan!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Membership</Text>

      <View style={styles.premiumContainer}>
        <Ionicons name="crown" size={30} color="white" />
        <Text style={styles.premiumTitle}>Join Our Premium</Text>
        <Text style={styles.premiumSubtitle}>
          Unlock powerful tools for your events
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.planOption,
          selectedPlan === 'weekly' && styles.selectedPlan,
        ]}
        onPress={() => setSelectedPlan('weekly')}>
        <Ionicons name="checkmark-circle" size={20} color="white" />
        <View>
          <Text style={styles.planText}>Weekly</Text>
          <Text style={styles.planDesc}>Pay for 7 days</Text>
        </View>
        <Text style={styles.planPrice}>$9.99</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planOption,
          selectedPlan === 'monthly' && styles.selectedPlan,
        ]}
        onPress={() => setSelectedPlan('monthly')}>
        <Ionicons name="checkmark-circle-outline" size={20} color="gray" />
        <View>
          <Text style={styles.planText}>Monthly</Text>
          <Text style={styles.planDesc}>Pay Monthly for more features</Text>
        </View>
        <View style={styles.planDetails}>
          <Text style={styles.planPrice}>$19.99</Text>
          <Text style={styles.planBadge}>Most Popular</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.planOption,
          selectedPlan === 'yearly' && styles.selectedPlan,
        ]}
        onPress={() => setSelectedPlan('yearly')}>
        <Ionicons name="checkmark-circle-outline" size={20} color="gray" />
        <View>
          <Text style={styles.planText}>Yearly</Text>
          <Text style={styles.planDesc}>Pay for a full year</Text>
        </View>
        <View style={styles.planDetails}>
          <Text style={styles.planPrice}>$49.99</Text>
          <Text style={styles.planBadge}>Save 12%</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.note}>No Commitment · Cancel anytime***</Text>

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
        <View style={styles.featureItem}>
          <Ionicons name="checkmark" size={20} color="green" />
          <Text style={styles.featureText}>Unlimited Event Creation</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark" size={20} color="green" />
          <Text style={styles.featureText}>
            Your events will be featured under "Recommended for You"
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark" size={20} color="green" />
          <Text style={styles.featureText}>Advertise Your Events</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark" size={20} color="green" />
          <Text style={styles.featureText}>Advanced Analytics & Reports</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark" size={20} color="green" />
          <Text style={styles.featureText}>Detailed Event Insights</Text>
        </View>
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
  backButton: {
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
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
    fontSize: 14,
    color: 'white',
  },
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
  selectedPlan: {
    backgroundColor: '#4CAF50',
  },
  planText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planDesc: {
    fontSize: 12,
    color: 'gray',
  },
  planDetails: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  planBadge: {
    fontSize: 12,
    color: 'green',
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: 'gray',
    marginVertical: 10,
  },
  subscribeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  subscribeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 10,
  },
  linkText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  footerLink: {
    fontSize: 12,
    color: 'gray',
  },
  featuresContainer: {
    marginTop: 20,
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default OrganizerSubscribe;
