import React from 'react';
import {Image, Pressable, Text, View, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UpComingEvent = ({item}) => {
  const navigation = useNavigation();

  const handleNavigation = () => {
    navigation.navigate('EventSetUp', {item});
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
      </View>
    </Pressable>
  );
};

export default UpComingEvent;
