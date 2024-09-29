import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ImageBackground,
} from 'react-native';
import React, {useLayoutEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const HomeScreen = () => {
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerLeft: () => (
        <View>
          <Text style={{marginLeft: 15}}>Can Gündüz</Text>
        </View>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginRight: 15,
          }}>
          <Ionicons name="chatbox-outline" size={24} color="black" />
          <Ionicons name="notifications-outline" size={24} color="black" />
          <Pressable>
            <Image
              style={{width: 30, height: 30, borderRadius: 15}}
              source={{
                uri: 'https://lh3.googleusercontent.com/ogw/AF2bZygt1JucrWn0fCbOOWjGjCOa_3Q88Fw4DT0zyVurZmbzxwc=s32-c-mo',
              }}
            />
          </Pressable>
        </View>
      ),
    });
  }, []);

  const data = [
    {
      id: '10',
      image:
        'https://images.pexels.com/photos/2247678/pexels-photo-2247678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      text: 'Test 1',
      description: 'Know more',
    },
    {
      id: '11',
      image:
        'https://images.pexels.com/photos/2247678/pexels-photo-2247678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      text: 'Test 2',
      description: 'Know more',
    },
    {
      id: '12',
      image:
        'https://images.pexels.com/photos/2247678/pexels-photo-2247678.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      text: 'Test 3',
      description: 'Know more',
    },
  ];
  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F8F8F8'}}>
      <View
        style={{
          padding: 13,
          backgroundColor: 'white',
          margin: 15,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 1},
          shadowOpacity: 0.25,
          shadowRadius: 2,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
          <Image
            style={{width: 40, height: 40, borderRadius: 25}}
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/128/785/785116.png',
            }}
          />
        </View>
        <View>
          <View>
            <Text>Set Your Weekly Fit Goal</Text>
            <Image
              style={{width: 20, height: 20, borderRadius: 10}}
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/128/426/426833.png',
              }}
            />
          </View>
          <Text style={{marginTop: 8, color: 'gray'}}>Keep yourself it</Text>
        </View>
      </View>
      <View
        style={{
          padding: 13,
          backgroundColor: 'white',
          marginVertical: 16,
          marginHorizontal: 13,
          borderRadius: 12,
        }}>
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: '#E0E0E0',
            borderRadius: 4,
            width: 200,
            marginVertical: 5,
          }}>
          <Text style={{color: '#484848', fontSize: 13}}>Deneme</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={{color: '#484848', fontSize: 16}}>Deneme 2</Text>
          <Pressable
            style={{
              padding: 10,
              backgroundColor: 'white',
              borderRadius: 7,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              width: 80,
            }}>
            <Text style={{textAlign: 'center'}}>Deneme 3</Text>
          </Pressable>
        </View>
        <Text style={{marginTop: 4, color: 'gray'}}>
          You have no events today
        </Text>
        <Pressable
          style={{
            marginVertical: 15,
            marginLeft: 'auto',
            marginRight: 'auto',
            marginBottom: 5,
          }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              textDecorationLine: 'underline',
            }}>
            View My Calendar
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          padding: 13,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 20,
        }}>
        <Pressable style={{flex: 1}}>
          <View style={{borderRadius: 10}}>
            <Image
              style={{width: 180, height: 120, borderRadius: 10}}
              source={{
                uri: 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              }}
            />
          </View>
          <Pressable
            style={{
              backgroundColor: 'white',
              padding: 12,
              width: 180,
              borderRadius: 10,
            }}>
            <View>
              <Text style={{fontSize: 15, fontWeight: '500'}}>Join</Text>
              <Text style={{fontSize: 15, color: 'gray', marginTop: 7}}>
                Discover and join new groups
              </Text>
            </View>
          </Pressable>
        </Pressable>
        <Pressable style={{flex: 1}}>
          <View style={{borderRadius: 10}}>
            <Image
              style={{width: 180, height: 120, borderRadius: 10}}
              source={{
                uri: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
              }}
            />
          </View>
          <Pressable
            style={{
              backgroundColor: 'white',
              padding: 12,
              width: 180,
              borderRadius: 10,
            }}>
            <View>
              <Text style={{fontSize: 15, fontWeight: '500'}}>Book</Text>
              <Text style={{fontSize: 15, color: 'gray', marginTop: 7}}>
                Reserve your spot at nearby venues
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </View>
      <View style={{padding: 13}}>
        <View
          style={{
            padding: 10,
            backgroundColor: 'white',
            borderRadius: 10,
            flexDirection: 'row',
            gap: 10,
          }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#29AB87',
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <AntDesign name="addusergroup" size={24} color="green" />
          </View>
          <View>
            <Text style={{fontWeight: 'bold'}}>Groups</Text>
            <Text style={{color: 'gray', marginTop: 10}}>
              Join groups to meet people like you
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: 10,
            backgroundColor: 'white',
            borderRadius: 10,
            flexDirection: 'row',
            gap: 10,
            marginTop: 15,
          }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: 'yellow',
              padding: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons name="mic-circle-outline" size={24} color="green" />
          </View>
          <View>
            <Text style={{fontWeight: 'bold'}}>Activities</Text>
            <Text style={{color: 'gray', marginTop: 10}}>
              ... eventmate hosted events
            </Text>
          </View>
        </View>
      </View>

      <View style={{padding: 13}}>
        <View style={{padding: 10, backgroundColor: 'white', borderRadius: 10}}>
          <Text style={{fontSize: 15, fontWeight: '500'}}>SpotLight</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {data?.map((item, index) => (
              <ImageBackground
                imageStyle={{borderRadius: 10}}
                style={{
                  width: 220,
                  height: 280,
                  marginRight: 10,
                  marginVertical: 15,
                  resizeMode: 'contain',
                }}
                source={{uri: item?.image}}></ImageBackground>
            ))}
          </ScrollView>
        </View>
      </View>

      <View>
        <View style={{marginLeft: 'auto', marginRight: 'auto'}}>
          <Image
            style={{width: 120, height: 70, resizeMode: 'contain'}}
            source={{
              uri: 'https://images.pexels.com/photos/1337380/pexels-photo-1337380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            }}
          />
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
          <View>
            <Text style={{width: 70, textAlign: 'center'}}>EventMate</Text>
          </View>
          <View style={{flex: 1, height: 1, backgroundColor: 'black'}} />
        </View>
        <Text style={{color: 'gray', textAlign: 'center', marginTop:5}}>Your event app</Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
