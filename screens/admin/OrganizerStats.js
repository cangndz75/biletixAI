import React, {useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../../AuthContext';
import {BarChart} from 'react-native-chart-kit';

const API_BASE_URL = 'https://biletixai.onrender.com';

const OrganizerStats = () => {
  const {userId, role} = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'organizer') {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/organizer-stats`, {
        params: {userId},
      });
      console.log('📊 Organizer Stats Response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('❌ Stats Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!loading && role !== 'organizer') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied ❌</Text>
        <Text>You are not an organizer.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF6B6B" />
      ) : (
        <>
          <Text style={styles.title}>📊 Organizer Stats</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Events || 0</Text>
            <Text style={styles.cardText}>{stats.totalEvents} || 0</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Attendees || 0</Text>
            <Text style={styles.cardText}>{stats.totalAttendees}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Communities || 0</Text>
            <Text style={styles.cardText}>{stats.totalCommunities}</Text>
          </View>

          <Text style={styles.subtitle}>📅 Last 30 Days Event Attendance</Text>
          <BarChart
            data={{
              labels:
                stats?.last30DaysEvents?.map(e => e._id.split('T')[0]) ?? [],
              datasets: [
                {data: stats?.last30DaysEvents?.map(e => e.attendees) ?? []},
              ],
            }}
            width={350}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#FF6B6B',
              backgroundGradientFrom: '#FF8C8C',
              backgroundGradientTo: '#FF6B6B',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={{marginVertical: 10, borderRadius: 16}}
          />

          <Text style={styles.subtitle}>🔥 Most Popular Events</Text>
          {stats?.topEvents?.map(event => (
            <View key={event._id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDetails}>
                {event.attendees.length} attendees
              </Text>
              <Text style={styles.eventDetails}>{event.date}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20, alignItems: 'center'},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20},
  subtitle: {fontSize: 18, fontWeight: 'bold', marginTop: 10},
  errorText: {fontSize: 18, fontWeight: 'bold', color: 'red', marginTop: 20},
  card: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  cardTitle: {fontSize: 18, fontWeight: 'bold', color: 'white'},
  cardText: {fontSize: 22, fontWeight: 'bold', color: 'white'},
  eventCard: {
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  eventTitle: {fontSize: 16, fontWeight: 'bold'},
  eventDetails: {fontSize: 14, color: '#666'},
});

export default OrganizerStats;
