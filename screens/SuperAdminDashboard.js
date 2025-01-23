import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SuperAdminDashboard = ({navigation}) => {
  const [totalOrganizers, setTotalOrganizers] = useState(42);
  const [pendingApprovals, setPendingApprovals] = useState(5);
  const [totalEvents, setTotalEvents] = useState(120);
  const [staffMembers, setStaffMembers] = useState(8);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>Jan 20, 2024</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="calendar-outline" size={24} color="#333" />
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <Ionicons name="settings-outline" size={24} color="#333" />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Organizer Status</Text>

      <View style={styles.statusContainer}>
        {[
          {title: 'Ongoing', color: '#FFD580'},
          {title: 'In Process', color: '#FFABAB'},
          {title: 'Complete', color: '#A8E6CF'},
          {title: 'Cancel', color: '#FF8C94'},
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.statusCard, {backgroundColor: item.color}]}>
            <Text style={styles.statusText}>{item.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Projects</Text>

      {[
        {
          title: '🎟️ Total Events',
          count: totalEvents,
          progress: '65%',
          color: '#4CAF50',
        },
        {
          title: '👥 Pending Approvals',
          count: pendingApprovals,
          progress: '40%',
          color: '#FF9800',
        },
        {
          title: '👨‍💼 Staff Members',
          count: staffMembers,
          progress: '80%',
          color: '#009688',
        },
      ].map((item, index) => (
        <View key={index} style={styles.projectCard}>
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>{item.title}</Text>
            <Text style={styles.projectDetail}>{item.count}</Text>
          </View>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {width: item.progress, backgroundColor: item.color},
              ]}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddStaffScreen')}>
        <Ionicons name="person-add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add New Staff</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('ManageOrganizersScreen')}>
        <Ionicons name="people" size={24} color="white" />
        <Text style={styles.manageButtonText}>See Organizers</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('RequestForOrganizer')}>
        <Ionicons name="clipboard" size={24} color="white" />
        <Text style={styles.manageButtonText}>
          Manage Requests to Become Organizer
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statusCard: {
    width: '22%',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  projectCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  projectDetail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  progressContainer: {
    backgroundColor: '#ddd',
    height: 10,
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  manageButton: {
    flexDirection: 'row',
    backgroundColor: '#FF6F00',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default SuperAdminDashboard;
