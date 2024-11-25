import {Image, Pressable, SafeAreaView, Text, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#f2f2f2'}}>
        <View
          style={{
            alignItems: 'center',
            padding: 25,
            backgroundColor: '#fff',
            flex: 1,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowOffset: {width: 0, height: -5},
            shadowRadius: 10,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginBottom: 10,
              color: '#333',
            }}>
            Find Players in your neighbourhood
          </Text>
          <Text style={{fontSize: 16, color: '#666', marginBottom: 20}}>
            Just like you did as a kid!
          </Text>
          <Image
            source={{
              uri: 'https://playo.co/img/logos/logo-green-1.svg',
            }}
            style={{
              width: 120,
              height: 40,
              marginTop: 20,
              resizeMode: 'contain',
            }}
          />
        </View>

        <Pressable
          style={{
            padding: 10,
            borderRadius: 8,
            marginHorizontal: 30,
            alignItems: 'center',
            marginBottom: 15,
          }}
          onPress={() => navigation.navigate('Login')}>
          <Text style={{fontSize: 16, color: 'gray', fontWeight: 'bold'}}>
            Already have an account? Login
          </Text>
        </Pressable>
      </SafeAreaView>

      <View style={{padding: 10, backgroundColor: 'white', marginTop: 'auto'}}>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={{
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 7,
            borderWidth: 2,
            borderColor: '#000',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: '#000',
              fontWeight: '500',
              marginRight: 10,
            }}>
            READY
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default StartScreen;
