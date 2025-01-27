import React, {useContext} from 'react';
import {Image, Pressable, Text, View, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../AuthContext';

const UpComingEvent = ({item}) => {
  const navigation = useNavigation();
  const {role, userId} = useContext(AuthContext);
  // Kullanıcı organizer ise ve kendi etkinliği değilse, hiç render etme
  if (role === 'organizer' && item.organizer !== userId) {
    return null;
  }
  const handleNavigation = () => {
    const targetScreen =
      role === 'organizer' ? 'AdminEventSetUp' : 'EventSetUp';
    navigation.navigate(targetScreen, {item});
  };

  return (
    <Pressable
      onPress={handleNavigation}
      style={{
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 16,
        marginBottom: 16,
        width: Dimensions.get('window').width / 2 - 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      }}>
      <Image
        style={{width: '100%', height: 120, borderRadius: 12}}
        source={{uri: item.images?.[0] || 'https://via.placeholder.com/150'}}
      />

      <View style={{paddingVertical: 8}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', color: '#333'}}>
          {item.title}
        </Text>
        <Text style={{fontSize: 14, color: '#777', marginVertical: 2}}>
          {item.location}
        </Text>
        {role === 'organizer' && (
          <View
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
            <Ionicons name="cog-outline" size={16} color="#FF6347" />
            <Text style={{fontSize: 12, color: '#FF6347', marginLeft: 4}}>
              Manage Event
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default UpComingEvent;
