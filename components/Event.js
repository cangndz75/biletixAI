import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import React, {useContext, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../AuthContext';

const Event = ({item}) => {
  const navigation = useNavigation();
  const {user} = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search events..."
        placeholderTextColor="gray"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Pressable
        style={styles.eventContainer}
        onPress={() => navigation.navigate('Event', {item, user})}>
        <View style={styles.header}>
          <Text style={styles.title}>{item?.title}</Text>
          <Feather name="bookmark" size={24} color="black" />
        </View>

        <View style={styles.eventInfo}>
          <View style={styles.organizerContainer}>
            <Image
              style={styles.organizerImage}
              source={{uri: item?.organizerUrl}}
            />
            <View style={styles.attendeesContainer}>
              {item?.attendees
                ?.filter(c => c?.name !== item?.organizerName)
                ?.map(attendee => (
                  <Image
                    key={attendee?._id}
                    source={{uri: attendee?.imageUrl}}
                    style={styles.attendeeImage}
                  />
                ))}
            </View>
          </View>

          <View style={styles.participantInfo}>
            <Text style={styles.participantText}>
              · {item?.attendees?.length}/{item?.totalParticipants} going
            </Text>
          </View>

          <View style={styles.spotsLeft}>
            <Text style={styles.spotsLeftText}>
              Only {item?.totalParticipants - item?.attendees?.length} spots
              left
            </Text>
          </View>
        </View>
        <View>
          <Text style={styles.organizerName}>
            Organizasyon: {item?.organizerName}
          </Text>
          <Text style={styles.eventDate}>
            {item?.date}, {item?.time}
          </Text>
        </View>

        {item?.isFull && (
          <Image
            style={styles.fullEventImage}
            source={{
              uri: 'https://playo.co/img/logos/logo-green-1.svg',
            }}
          />
        )}

        <View style={styles.locationContainer}>
          <SimpleLineIcons name="location-pin" size={24} color="black" />
          <Text
            ellipsizeMode="tail"
            numberOfLines={1}
            style={styles.locationText}>
            {item?.location}
          </Text>
        </View>

        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>Intermediate to Advanced</Text>
        </View>
      </Pressable>
    </View>
  );
};

export default Event;

const styles = StyleSheet.create({
  searchInput: {
    marginHorizontal: 14,
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    fontSize: 16,
    color: 'black',
  },
  eventContainer: {
    marginVertical: 10,
    marginHorizontal: 14,
    padding: 14,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
  },
  eventInfo: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerContainer: {
    flexDirection: 'row',
  },
  organizerImage: {
    width: 56,
    height: 56,
    borderRadius: 26,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -7,
  },
  attendeeImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: -7,
  },
  participantInfo: {
    marginLeft: 10,
    flex: 1,
  },
  participantText: {
    color: 'black',
  },
  spotsLeft: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fffbde',
    borderRadius: 8,
    borderColor: '#eedc82',
    borderWidth: 1,
  },
  spotsLeftText: {
    color: 'gray',
    fontWeight: '500',
  },
  organizerName: {
    marginTop: 10,
    color: 'gray',
    fontSize: 15,
  },
  eventDate: {
    marginTop: 10,
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  fullEventImage: {
    width: 100,
    height: 70,
    resizeMode: 'contain',
  },
  locationContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  locationText: {
    fontSize: 15,
    flex: 1,
    color: 'black',
  },
  levelContainer: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: 13,
    fontWeight: '400',
    color: 'black',
  },
});
