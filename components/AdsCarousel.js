import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AdsCarousel = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('https://biletixai.onrender.com/ads');
        const data = await response.json();
        setAds(data);
      } catch (error) {
        console.error('Error fetching ads:', error);
      }
    };

    fetchAds();
  }, []);

  const handleRedirect = url => {
    if (url) {
      const validUrl = url.startsWith('http') ? url : `https://${url}`;

      Linking.openURL(validUrl).catch(err =>
        console.error("❌ Couldn't open URL:", err),
      );
    }
  };

  const renderItem = ({item}) => (
    <View
      style={{
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 15,
        overflow: 'hidden',
        width: 340,
        marginRight: 15,
      }}>
      <Image
        source={{uri: item.imageUrl || 'https://via.placeholder.com/340'}}
        style={{
          width: '100%',
          height: 200,
          resizeMode: 'cover',
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          paddingVertical: 4,
          paddingHorizontal: 10,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 6,
        }}>
        <Text style={{fontSize: 11, color: '#fff', fontWeight: 'bold'}}>
          Sponsored
        </Text>
      </View>

      {item.redirectUrl && (
        <TouchableOpacity
          onPress={() => handleRedirect(item.redirectUrl)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: 6,
            borderRadius: 20,
          }}>
          <MaterialIcons name="open-in-new" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 70,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
        <Text
          style={{
            fontSize: 16,
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
          {item.title || 'Advertisement'}
        </Text>
        <Text style={{fontSize: 13, color: '#ddd', textAlign: 'center'}}>
          {item.description || 'Click to learn more'}
        </Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={ads}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      contentContainerStyle={{paddingLeft: 15, paddingRight: 15}}
    />
  );
};

export default AdsCarousel;
