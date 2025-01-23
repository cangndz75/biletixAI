import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import axios from 'axios';
import Animated, {
  LightSpeedInLeft,
  LightSpeedOutRight,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from 'react-native-alert-notification';

const RequestForOrganizer = () => {
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchPendingOrganizers();
  }, []);

  const fetchPendingOrganizers = async () => {
    try {
      const response = await axios.get(
        'https://biletixai.onrender.com/pending-organizers',
      );
      console.log('Fetched Data:', response.data);
      setPendingOrganizers(response.data);
    } catch (error) {
      console.error('Error fetching pending organizers:', error);
      Alert.alert('Error', 'Could not fetch pending organizers.');
    }
  };

  const handleDecision = async (userId, firstName, lastName, decision) => {
    try {
      await axios.post('https://biletixai.onrender.com/review-organizer', {
        userId,
        decision,
      });

      if (decision === 'approved') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: `${firstName} ${lastName} is now an organizer.`,
          button: 'OK',
        });
      }

      fetchPendingOrganizers();
    } catch (error) {
      console.error('Error reviewing application:', error);
      Alert.alert('Error', 'An error occurred while processing the request.');
    }
  };

  const renderItem = ({item}) => (
    <Animated.View
      entering={LightSpeedInLeft}
      exiting={LightSpeedOutRight}
      style={styles.card}>
      <View style={styles.userInfo}>
        <Image source={{uri: item.image}} style={styles.userImage} />
        <View>
          <Text style={styles.name}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.status}>
            Status: {item.organizerApplication?.status || 'Unknown'}
          </Text>
        </View>
      </View>

      <Text style={styles.question}>
        Why do you want to become an organizer?
      </Text>
      <Text style={styles.answer}>
        {item.organizerApplication?.reason || 'No response'}
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.approveButton]}
          onPress={() =>
            handleDecision(item._id, item.firstName, item.lastName, 'approved')
          }>
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() =>
            handleDecision(item._id, item.firstName, item.lastName, 'rejected')
          }>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Pending Organizer Requests</Text>
        </View>
        <FlatList
          data={pendingOrganizers}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  answer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestForOrganizer;
