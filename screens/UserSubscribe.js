import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserSubscribe = ({navigation}) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const handleSubscribe = () => {
    alert(`You have selected the ${selectedPlan} plan!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#000"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Subscription Plan</Text>
      </View>

      <View style={styles.premiumBox}>
        <Ionicons name="diamond" size={40} color="white" />
        <Text style={styles.premiumTitle}>Premium</Text>
        <Text style={styles.premiumSubtitle}>
          Unlock exclusive features for users
        </Text>
      </View>

      <View style={styles.planContainer}>
        <TouchableOpacity
          style={[
            styles.planOption,
            selectedPlan === 'weekly' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('weekly')}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={selectedPlan === 'weekly' ? 'white' : '#999'}
          />
          <Text style={styles.planText}>Weekly - $9.99</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planOption,
            selectedPlan === 'monthly' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('monthly')}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={selectedPlan === 'monthly' ? 'white' : '#999'}
          />
          <Text style={styles.planText}>Monthly - $19.99</Text>
          <Text style={styles.planBadge}>Most Popular</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.planOption,
            selectedPlan === 'yearly' && styles.selectedPlan,
          ]}
          onPress={() => setSelectedPlan('yearly')}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={selectedPlan === 'yearly' ? 'white' : '#999'}
          />
          <Text style={styles.planText}>Yearly - $49.99</Text>
          <Text style={styles.planBadge}>Save 12%</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commitmentText}>
        No Commitment. Cancel anytime***
      </Text>

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
        <Text style={styles.featuresTitle}>What's Included?</Text>

        <View style={styles.featureItem}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color="#4CAF50"
          />
          <Text style={styles.featureText}>Messaging with other users</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#FFC107" />
          <Text style={styles.featureText}>Verified User Badge</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="eye-outline" size={22} color="#2196F3" />
          <Text style={styles.featureText}>View event participants</Text>
        </View>

        <View style={styles.featureItem}>
          <Ionicons name="people-outline" size={22} color="#E91E63" />
          <Text style={styles.featureText}>
            See events your friends attended
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  premiumBox: {
    width: '100%',
    backgroundColor: '#6200EE',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
    textAlign: 'center',
  },
  planContainer: {
    width: '100%',
    marginBottom: 20,
  },
  planOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  selectedPlan: {
    backgroundColor: '#4CAF50',
  },
  planText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginLeft: 10,
  },
  planBadge: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  commitmentText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 10,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: '#6200EE',
    padding: 15,
    borderRadius: 10,
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
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  linkText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: '#FFF',
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
});

export default UserSubscribe;
