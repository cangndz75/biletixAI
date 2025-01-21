import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useRoute} from '@react-navigation/native';
import axios from 'axios';

const StaffQrScreen = () => {
  const route = useRoute();
  const {ticketSales, totalTickets, attendees, totalAttendees} =
    route.params || {};

  const [message, setMessage] = useState('');

  const handleBarcodeScanned = async e => {
    const scannedData = e.data;

    try {
      const response = await axios.get(
        `https://biletixai.onrender.com/validate-qr/${scannedData}`,
      );
      if (response.data.success) {
        setMessage('✅ Başarılı giriş! Etkinliğe geçiş yapabilirsiniz.');
      } else {
        setMessage('❌ Hata! Geçersiz QR kodu.');
      }
    } catch (error) {
      setMessage('❌ Sunucu hatası!');
      console.error('❌ QR doğrulama hatası:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.eventInfo}>
        <Text style={styles.infoText}>
          🎟️ Tickets Sold: {ticketSales}/{totalTickets}
        </Text>
        <Text style={styles.infoText}>
          👥 Checked-In: {attendees}/{totalAttendees}
        </Text>
      </View>

      <QRCodeScanner
        onRead={handleBarcodeScanned}
        topContent={<Text style={styles.scanText}>QR Kodunu Tara</Text>}
        bottomContent={
          <TouchableOpacity style={styles.scanAgainButton}>
            <Text style={styles.scanAgainText}>Tekrar Tara</Text>
          </TouchableOpacity>
        }
      />

      {message ? <Text style={styles.resultText}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  eventInfo: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  infoText: {fontSize: 16, fontWeight: 'bold', marginVertical: 5},
  scanText: {fontSize: 18, fontWeight: 'bold', marginBottom: 20},
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  scanAgainButton: {
    backgroundColor: '#6A5ACD',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  scanAgainText: {color: 'white', fontWeight: 'bold'},
});

export default StaffQrScreen;
