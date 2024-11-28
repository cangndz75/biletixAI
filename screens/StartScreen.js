import {Image, Pressable, SafeAreaView, Text, View} from 'react-native';
import React from 'react';
import {useNavigation} from '@react-navigation/native';

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#e8f5fe'}}>
        <View
          style={{
            alignItems: 'center',
            padding: 30,
            backgroundColor: '#fff',
            flex: 1,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: {width: 0, height: -5},
            shadowRadius: 15,
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              marginBottom: 15,
              color: '#1d3557',
              textAlign: 'center',
            }}>
            Connect, Play, and Make New Friends!
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: '#457b9d',
              marginBottom: 20,
              textAlign: 'center',
            }}>
            Rediscover the joy of playing with people around you.
          </Text>
          <Image
            source={{
              uri: 'https://playo.co/img/logos/logo-green-1.svg',
            }}
            style={{
              width: 150,
              height: 50,
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
            marginBottom: 20,
          }}
          onPress={() => navigation.navigate('Login')}>
          <Text style={{fontSize: 16, color: '#1d3557', fontWeight: 'bold'}}>
            Already have an account? Login
          </Text>
        </Pressable>
      </SafeAreaView>

      <View
        style={{
          padding: 15,
          backgroundColor: '#f1faee',
          marginTop: 'auto',
          borderTopWidth: 1,
          borderColor: '#ccc',
        }}>
        <Pressable
          onPress={() => navigation.navigate('Register')}
          style={{
            backgroundColor: '#457b9d',
            padding: 14,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
          }}>
          <Text
            style={{
              textAlign: 'center',
              color: '#fff',
              fontWeight: '600',
              fontSize: 16,
            }}>
            Get Started
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default StartScreen;
