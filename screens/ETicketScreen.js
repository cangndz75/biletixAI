import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import axios from 'axios';

const ETicketScreen = ({route}) => {
  const {event} = route.params || {};
  const eventId = event?._id;

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(event || null);

  useEffect(() => {
    console.log('📌 Gelen event:', event);
    console.log('📌 Gelen eventId:', eventId);

    if (!eventId) {
      console.error('❌ Hata: eventId alınamadı!');
      setLoading(false);
      return;
    }

    if (!eventData) {
      fetchEventDetails();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEventDetails = async () => {
    try {
      console.log(
        `🔎 API isteği yapılıyor: https://biletixai.onrender.com/event/${eventId}`,
      );
      const response = await axios.get(
        `https://biletixai.onrender.com/event/${eventId}`,
      );
      console.log('✅ API Yanıtı:', response.data);
      setEventData(response.data);
    } catch (error) {
      console.error(
        '❌ Etkinlik bilgisi çekilirken hata:',
        error?.response?.data || error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={styles.loadingText}>Etkinlik yükleniyor...</Text>
      </View>
    );
  }

  if (!eventData) {
    return (
      <Text style={styles.errorText}>❌ Etkinlik bilgisi yüklenemedi.</Text>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.ticket}>
        <Image
          source={{
            uri: eventData.images?.[0] || 'https://via.placeholder.com/150',
          }}
          style={styles.image}
        />

        <Text style={styles.title}>{eventData.title}</Text>

        <View style={styles.dottedLine} />

        <View style={styles.detailsContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Category</Text>
              <Text style={styles.value}>{eventData.category?.toString()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {new Date(eventData.date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>{eventData.location?.toString()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Price</Text>
              <Text style={styles.value}>${eventData.price?.toString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.organizerRow}>
          <Image
            source={{
              uri: eventData.organizerImage || 'https://via.placeholder.com/50',
            }}
            style={styles.organizerImage}
          />
          <Text style={styles.organizerName}>
            {eventData.organizer?.toString()}
          </Text>
        </View>

        <View style={styles.dottedLine} />

        <View style={styles.qrContainer}>
          <QRCode value={eventId} size={100} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  ticket: {
    backgroundColor: '#FFE5D4',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D35400',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  dottedLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#ccc',
    borderStyle: 'dashed',
    marginVertical: 10,
  },
  detailsContainer: {width: '100%', marginVertical: 10},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {flex: 1, alignItems: 'center'},
  label: {fontSize: 14, fontWeight: 'bold', color: '#555'},
  value: {fontSize: 16, fontWeight: 'bold', color: '#000'},
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  organizerImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  organizerName: {fontSize: 16, fontWeight: 'bold'},
  qrContainer: {marginTop: 20, alignItems: 'center'},
  errorText: {fontSize: 16, color: 'red', textAlign: 'center', marginTop: 20},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: '#6A5ACD'},
});

export default ETicketScreen;
