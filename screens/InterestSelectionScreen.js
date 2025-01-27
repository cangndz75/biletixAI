import React, {useState, useContext, useEffect} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from 'react-native-alert-notification';

const interests = [
  'concert',
  'Cultural',
  'Seminars',
  'Sports',
  'Theater',
  'Book Fair',
  'Food & Drink Festival',
  'Stand-up Comedy',
  'Dance',
  'Trade Shows',
  'Charity Events',
  'Science & Tech',
  'Travel & Tourism',
  'Carnivals',
];

const InterestSelectionScreen = ({navigation}) => {
  const {userId} = useContext(AuthContext);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInterests = async () => {
      try {
        console.log('Fetching interests for user:', userId);
        const response = await axios.get(
          `https://biletixai.onrender.com/user/${userId}/interests`,
        );

        if (response.data.interests) {
          setSelectedInterests(response.data.interests);
        } else {
          console.warn('No interests found for this user.');
        }
      } catch (error) {
        console.error(
          'Error fetching interests:',
          error.response ? error.response.data : error.message,
        );
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error!',
          textBody: 'Failed to fetch your interests.',
          button: 'Close',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserInterests();
    } else {
      console.warn('User ID is not available');
    }
  }, [userId]);

  const toggleInterest = interest => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else if (selectedInterests.length < 5) {
      setSelectedInterests([...selectedInterests, interest]);
    } else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Limit Aşıldı',
        textBody: 'En fazla 5 ilgi alanı seçebilirsiniz.',
        button: 'Kapat',
      });
    }
  };

  const saveInterests = async () => {
    try {
      await axios.post(
        `https://biletixai.onrender.com/user/${userId}/interests`,
        {interests: selectedInterests},
      );

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Başarılı!',
        textBody: 'İlgi alanlarınız kaydedildi!',
        button: 'Tamam',
      });
      navigation.replace('Profile');
    } catch (error) {
      console.error('Error saving interests:', error);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Hata!',
        textBody: 'İlgi alanlarınız kaydedilirken bir sorun oluştu.',
        button: 'Kapat',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading interests...</Text>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          backgroundColor: '#fff',
        }}>
        <Text style={{fontSize: 32, fontWeight: 'bold', marginBottom: 5}}>
          Choose
        </Text>
        <Text style={{fontSize: 32, fontWeight: 'bold', marginBottom: 15}}>
          Your Interest
        </Text>
        <Text style={{fontSize: 16, color: '#666', marginBottom: 20}}>
          Choose your favourite interests and let us help you find the perfect
          events for you!
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
          }}>
          {interests.map((interest, index) => (
            <TouchableOpacity
              key={index}
              style={{
                borderWidth: 1,
                borderColor: selectedInterests.includes(interest)
                  ? '#f0b400'
                  : '#ccc',
                borderRadius: 20,
                paddingVertical: 10,
                paddingHorizontal: 15,
                margin: 5,
                backgroundColor: selectedInterests.includes(interest)
                  ? '#f0b400'
                  : '#fff',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '45%',
              }}
              onPress={() => toggleInterest(interest)}>
              <Text
                style={{
                  fontSize: 16,
                  color: selectedInterests.includes(interest) ? '#fff' : '#333',
                  fontWeight: 'bold',
                }}>
                {interest}
              </Text>
              {selectedInterests.includes(interest) && (
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 30,
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 20,
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveInterests}
            style={{
              backgroundColor: '#007bff',
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 20,
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AlertNotificationRoot>
  );
};

export default InterestSelectionScreen;
