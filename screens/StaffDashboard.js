import React, {useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {ProgressBar} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StaffDashboard = () => {
  const [ticketSales, setTicketSales] = useState(18);
  const [totalTickets, setTotalTickets] = useState(100);
  const [attendees, setAttendees] = useState(17);
  const [totalAttendees, setTotalAttendees] = useState(18);

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

      <View
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 15,
          marginBottom: 20,
          elevation: 3,
        }}>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>🎟️ Ticket Sales</Text>
        <ProgressBar
          progress={ticketSales / totalTickets}
          color="#FF5E00"
          style={{marginVertical: 10}}
        />
        <Text style={{textAlign: 'center', fontSize: 16}}>
          {ticketSales}/{totalTickets} Tickets Sold
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#fff',
          padding: 20,
          borderRadius: 15,
          marginBottom: 20,
          elevation: 3,
        }}>
        <Text style={{fontSize: 18, fontWeight: 'bold'}}>👥 Attendance</Text>
        <ProgressBar
          progress={attendees / totalAttendees}
          color="#007bff"
          style={{marginVertical: 10}}
        />
        <Text style={{textAlign: 'center', fontSize: 16}}>
          {attendees}/{totalAttendees} Attendees Checked-In
        </Text>
      </View>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          backgroundColor: '#FF5E00',
          padding: 15,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Ionicons name="qr-code" size={24} color="white" />
        <Text style={{color: 'white', fontSize: 18, marginLeft: 10}}>
          Scan Tickets
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          backgroundColor: '#333',
          padding: 15,
          borderRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Ionicons name="checkmark-circle" size={24} color="white" />
        <Text style={{color: 'white', fontSize: 18, marginLeft: 10}}>
          Check Attendees In
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default StaffDashboard;
