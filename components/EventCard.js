import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EventCard = ({event, navigation}) => {
  return (
    <View style={styles.container}>
      {/* Arka Plan Resmi */}
      <Image source={{uri: event.image}} style={styles.eventImage} />
      <View style={styles.overlay} />

      {/* Üst Menü Butonları */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.circleButton}>
          <Ionicons name="heart-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Etkinlik Bilgisi */}
      <View style={styles.eventInfo}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>Jul 8</Text>
        </View>
        <Text style={styles.title}>{event.title}</Text>
        <View style={styles.detailsRow}>
          <Ionicons name="location-outline" size={18} color="#fff" />
          <Text style={styles.detailText}>{event.location}</Text>
          <Ionicons name="cash-outline" size={18} color="#fff" />
          <Text style={styles.detailText}>{event.price}</Text>
        </View>
      </View>

      {/* Organizasyon Kartı */}
      <View style={styles.organizerCard}>
        <View style={styles.organizerInfo}>
          <Image
            source={{uri: event.organizer.image}}
            style={styles.organizerImage}
          />
          <View>
            <Text style={styles.organizerName}>{event.organizer.name}</Text>
            <Text style={styles.organizerRole}>Event Organizer</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.plusButton}>
          <Ionicons name="add" size={22} color="#FFC107" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {position: 'relative', backgroundColor: '#fff', borderRadius: 12},
  eventImage: {
    width: '100%',
    height: 220,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: 220,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  topButtons: {
    position: 'absolute',
    top: 15,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  eventInfo: {position: 'absolute', bottom: 15, left: 15},
  dateBadge: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  dateText: {fontSize: 14, fontWeight: 'bold', color: '#333'},
  title: {fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 5},
  detailsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  detailText: {fontSize: 14, color: '#fff', marginLeft: 4, marginRight: 10},

  organizerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    margin: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },
  organizerInfo: {flexDirection: 'row', alignItems: 'center'},
  organizerImage: {width: 40, height: 40, borderRadius: 20, marginRight: 10},
  organizerName: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  organizerRole: {fontSize: 12, color: '#777'},
  plusButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventCard;
