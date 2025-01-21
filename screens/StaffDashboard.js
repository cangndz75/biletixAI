import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';

const StaffDashboard = () => {
  const navigation = useNavigation();

  const [eventsCount, setEventsCount] = useState(0);
  const [ticketSales, setTicketSales] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [attendees, setAttendees] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://biletixai.onrender.com/events');
      const events = response.data || [];

      let totalSoldTickets = 0;
      let totalAvailableTickets = 0;
      let totalCheckedIn = 0;
      let totalAttendeesExpected = 0;

      events.forEach(event => {
        totalSoldTickets += event.ticketSales || 0;
        totalAvailableTickets += event.totalTickets || 0;
        totalCheckedIn += event.attendees || 0;
        totalAttendeesExpected += event.totalAttendees || 0;
      });

      setEventsCount(events.length);
      setTicketSales(totalSoldTickets);
      setTotalTickets(totalAvailableTickets);
      setAttendees(totalCheckedIn);
      setTotalAttendees(totalAttendeesExpected);
    } catch (err) {
      setError('❌ Veriler alınırken hata oluştu.');
      console.error('❌ API Hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanTickets = () => {
    navigation.navigate('StaffQrScreen', {
      ticketSales,
      totalTickets,
      attendees,
      totalAttendees,
      updateTicketSales,
    });
  };

  const updateTicketSales = () => {
    setTicketSales(prev => prev + 1);
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{marginTop: 10}}>Veriler Yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'red', fontSize: 16}}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F7F8FA', padding: 20}}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 20,
        }}>
        Staff Dashboard
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 Total Events</Text>
        <Text style={styles.cardText}>{eventsCount} Events</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎟️ Ticket Sales</Text>
        <ProgressBar
          progress={totalTickets ? ticketSales / totalTickets : 0}
          color="#FF5E00"
          style={{marginVertical: 10}}
        />
        <Text style={styles.cardText}>
          {ticketSales}/{totalTickets} Tickets Sold
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👥 Attendance</Text>
        <ProgressBar
          progress={totalAttendees ? attendees / totalAttendees : 0}
          color="#007bff"
          style={{marginVertical: 10}}
        />
        <Text style={styles.cardText}>
          {attendees}/{totalAttendees} Attendees Checked-In
        </Text>
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScanTickets}>
        <Ionicons name="qr-code" size={24} color="white" />
        <Text style={styles.buttonText}>Scan Tickets</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.attendeesButton}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={styles.buttonText}>Check Attendees In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = {
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  scanButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5E00',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  attendeesButton: {
    flexDirection: 'row',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
};

export default StaffDashboard;
