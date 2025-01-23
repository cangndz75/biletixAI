import React, {useContext, useEffect, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import {BottomModal, ModalContent, SlideAnimation} from 'react-native-modals';
import moment from 'moment';
import {AuthContext} from '../../AuthContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Switch} from 'react-native-paper';

const AdminCreateScreen = () => {
  const [event, setEvent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [timeInterval, setTimeInterval] = useState('');
  const [noOfParticipants, setNoOfParticipants] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [images, setImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [taggedVenue, setTaggedVenue] = useState(null);
  const [times] = useState(['10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM']);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [remainingEventLimit, setRemainingEventLimit] = useState(0);

  const navigation = useNavigation();
  const {userId} = useContext(AuthContext);
  const route = useRoute();

  const eventTypes = ['Concert', 'Football', 'Theater', 'Dance', 'Other'];
  const CLOUDINARY_URL =
    'https://api.cloudinary.com/v1_1/dhe3yon5d/image/upload';
  const UPLOAD_PRESET = 'eventmate';
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `https://biletixai.onrender.com/user/${userId}`,
        );
        if (response.data) {
          setRemainingEventLimit(response.data.remainingEventLimit);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserDetails();
  }, [userId]);
  useEffect(() => {
    if (route.params?.taggedVenue) {
      setTaggedVenue(route.params.taggedVenue);
      setLocation(route.params.taggedVenue);
    }
  }, [route.params]);

  const openImagePicker = () => {
    launchImageLibrary({mediaType: 'photo', selectionLimit: 3}, response => {
      if (response.assets) {
        const imageUris = response.assets.map(image => image.uri);
        setImages(imageUris);
      }
    });
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = moment().add(i, 'days');
      let displayDate;
      if (i === 0) {
        displayDate = 'Today';
      } else if (i === 1) {
        displayDate = 'Tomorrow';
      } else if (i === 2) {
        displayDate = 'Day after';
      } else {
        displayDate = date.format('Do MMMM');
      }
      dates.push({
        id: i.toString(),
        displayDate,
        dayOfWeek: date.format('dddd'),
        actualDate: date.format('Do MMMM'),
      });
    }
    return dates;
  };
  const dates = generateDates();

  console.log('Dates', dates);

  const generateContent = async field => {
    try {
      if (!event || !taggedVenue) {
        return Alert.alert(
          'Error',
          'Please enter both event name and location.',
        );
      }

      const response = await axios.post(
        'https://biletixai.onrender.com/generate',
        {
          eventName: event,
          location: taggedVenue,
        },
      );

      if (response.status === 200) {
        const generatedContent = response.data.response.trim();
        field === 'description'
          ? setDescription(generatedContent)
          : setTags(generatedContent);
      } else {
        Alert.alert('Error', 'Failed to generate content. Try again.');
      }
    } catch (error) {
      console.error('Error generating content:', error.message);
      Alert.alert('Error', 'Failed to generate content. Try again.');
    }
  };
  useEffect(() => {
    console.log('Selected Images:', images);
  }, [images]);
  console.log('Event:', event);
  console.log('Location:', taggedVenue);
  console.log('Date:', date);
  console.log('Time:', timeInterval);
  console.log('Type:', selectedType);
  console.log('Participants:', noOfParticipants);

  const createEvent = async () => {
    if (remainingEventLimit === 0) {
      Alert.alert(
        'Upgrade Required',
        'You have reached your event limit. Upgrade to OrganizerPlus.',
      );
      return;
    }

    if (
      !event ||
      !selectedType ||
      !location ||
      !date ||
      !timeInterval ||
      !noOfParticipants
    ) {
      Alert.alert('Error', 'All required fields must be filled.');
      return;
    }

    try {
      let uploadedImageUrls = [];

      if (images.length > 0) {
        for (const img of images) {
          try {
            const formData = new FormData();
            formData.append('file', {
              uri: img,
              type: 'image/jpeg',
              name: `event_${Date.now()}.jpg`,
            });
            formData.append('upload_preset', UPLOAD_PRESET);

            const uploadResponse = await axios.post(CLOUDINARY_URL, formData, {
              headers: {'Content-Type': 'multipart/form-data'},
            });

            if (uploadResponse.data.secure_url) {
              uploadedImageUrls.push(uploadResponse.data.secure_url);
            }
          } catch (uploadError) {
            console.error('Cloudinary Upload Error:', uploadError);
          }
        }
      }

      const eventData = {
        title: event,
        eventType: selectedType.toLowerCase(),
        location: taggedVenue || location,
        date,
        time: timeInterval,
        totalParticipants: parseInt(noOfParticipants, 10),
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        images: uploadedImageUrls,
        isPaid,
        price: isPaid ? Number(price) || 0 : 0,
        organizer: userId,
      };

      console.log('📤 Sending Event Data:', JSON.stringify(eventData, null, 2));

      const response = await axios.post(
        'https://biletixai.onrender.com/createevent',
        eventData,
        {headers: {'Content-Type': 'application/json'}},
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Event created successfully!');
        setRemainingEventLimit(prev => prev - 1);
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error(
        'Event Creation Error:',
        error.response?.data || error.message,
      );
      Alert.alert(
        'Error',
        `Failed to create event. ${error.response?.data?.message || ''}`,
      );
    }
  };

  const selectDate = selectedDate => {
    const formattedDate = moment(selectedDate, 'Do MMMM').format('YYYY-MM-DD');
    setDate(formattedDate);
    setModalVisible(false);
  };

  const selectTime = selectedTime => {
    setTimeInterval(selectedTime);
    setTimeModalVisible(false);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={{padding: 20}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}>
          <Ionicons
            name="arrow-back"
            size={28}
            onPress={() => navigation.goBack()}
          />
          <Text style={{fontSize: 28, fontWeight: 'bold', marginLeft: 10}}>
            Create Event
          </Text>
        </View>

        <TouchableOpacity onPress={openImagePicker} style={buttonStyle}>
          <Feather name="image" size={24} color="#4a4a4a" />
          <Text style={{marginTop: 5, color: '#4a4a4a'}}>Upload Photos</Text>
        </TouchableOpacity>

        <ScrollView horizontal style={{marginBottom: 10}}>
          {images.map((uri, index) => (
            <Image
              key={index}
              source={{uri}}
              style={{width: 80, height: 80, marginRight: 10, borderRadius: 10}}
            />
          ))}
        </ScrollView>

        <TextInput
          placeholder="Event Name"
          value={event}
          onChangeText={setEvent}
          style={inputStyle}
        />

        <Pressable
          onPress={() => navigation.navigate('TagVenue')}
          style={locationPickerStyle}>
          <Entypo name="location" size={24} color="gray" />
          <View style={{flex: 1}}>
            <Text style={{fontSize: 17, fontWeight: '500'}}>Area</Text>
            <TextInput
              value={location || taggedVenue}
              onChangeText={setLocation}
              placeholder="Locality or venue name"
              style={inputStyle}
            />
          </View>
          <AntDesign name="arrowright" size={24} color="gray" />
        </Pressable>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={datePickerStyle}>
          <Feather name="calendar" size={24} color="#4a4a4a" />
          <Text style={dateTextStyle}>{date || 'Select a Date'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTimeModalVisible(true)}
          style={datePickerStyle}>
          <AntDesign name="clockcircleo" size={24} color="#4a4a4a" />
          <Text style={dateTextStyle}>{timeInterval || 'Select a Time'}</Text>
        </TouchableOpacity>

        <BottomModal
          visible={modalVisible}
          onTouchOutside={() => setModalVisible(false)}
          swipeDirection={['up', 'down']}
          modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
          <ModalContent
            style={{width: '100%', height: 400, backgroundColor: 'white'}}>
            <Text
              style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
              Choose a Date
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                marginVertical: 20,
              }}>
              {dates.map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => selectDate(item.actualDate)}
                  style={dateOptionStyle}>
                  <Text>{item.displayDate}</Text>
                  <Text style={{color: 'gray'}}>{item.dayOfWeek}</Text>
                </Pressable>
              ))}
            </View>
          </ModalContent>
        </BottomModal>

        <BottomModal
          visible={timeModalVisible}
          onTouchOutside={() => setTimeModalVisible(false)}
          swipeDirection={['up', 'down']}
          modalAnimation={new SlideAnimation({slideFrom: 'bottom'})}>
          <ModalContent
            style={{width: '100%', height: 300, backgroundColor: 'white'}}>
            <Text
              style={{textAlign: 'center', fontSize: 16, fontWeight: 'bold'}}>
              Choose a Time
            </Text>
            <View style={{marginVertical: 20}}>
              {times.map((time, index) => (
                <Pressable
                  key={index}
                  onPress={() => selectTime(time)}
                  style={timeOptionStyle}>
                  <Text style={{fontSize: 16}}>{time}</Text>
                </Pressable>
              ))}
            </View>
          </ModalContent>
        </BottomModal>

        <TextInput
          placeholder="Total Participants"
          keyboardType="number-pad"
          value={noOfParticipants}
          onChangeText={setNoOfParticipants}
          style={inputStyle}
        />

        <View style={{marginBottom: 10}}>
          <Text style={{marginBottom: 10}}>Event Type</Text>
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {eventTypes.map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => setSelectedType(type)}
                style={[
                  typeButtonStyle,
                  selectedType === type && {backgroundColor: '#4CAF50'},
                ]}>
                <Text
                  style={{color: selectedType === type ? 'white' : 'black'}}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          placeholder="Event Description"
          value={description}
          onChangeText={setDescription}
          multiline
          style={[inputStyle, {height: 100}]}
        />

        <TouchableOpacity
          onPress={() => generateContent('description')}
          style={generateButtonStyle}>
          <Text style={buttonTextStyle}>Generate Description</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          style={inputStyle}
        />

        <TouchableOpacity
          onPress={() => generateContent('tags')}
          style={generateButtonStyle}>
          <Text style={buttonTextStyle}>Generate Tags</Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginVertical: 10,
            paddingHorizontal: 10,
          }}>
          <Text style={{fontSize: 16, color: '#333'}}>Is the event paid?</Text>
          <Switch
            value={isPaid}
            onValueChange={setIsPaid}
            thumbColor={isPaid ? '#4CAF50' : '#f4f3f4'}
            trackColor={{false: '#767577', true: '#81b0ff'}}
          />
        </View>

        {isPaid && (
          <TextInput
            placeholder="Enter Price"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 10,
              padding: 15,
              marginVertical: 10,
            }}
          />
        )}

        <TouchableOpacity
          onPress={
            remainingEventLimit === 0
              ? () => navigation.navigate('OrganizerSubscription')
              : createEvent
          }
          style={createButtonStyle}>
          <Text style={buttonTextStyle}>
            {remainingEventLimit === 0 ? 'Be Plus' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 15,
  marginBottom: 10,
};

const buttonStyle = {
  backgroundColor: '#f0f0f0',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
  marginBottom: 10,
};

const generateButtonStyle = {
  backgroundColor: '#1E90FF',
  paddingVertical: 15,
  borderRadius: 10,
  marginBottom: 10,
};

const buttonTextStyle = {
  color: 'white',
  textAlign: 'center',
  fontSize: 16,
};

const typeButtonStyle = {
  paddingVertical: 10,
  paddingHorizontal: 20,
  backgroundColor: '#eee',
  borderRadius: 10,
  marginRight: 10,
  marginBottom: 10,
};

const datePickerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f0f0',
  padding: 15,
  borderRadius: 10,
  marginVertical: 10,
};

const dateOptionStyle = {
  padding: 10,
  borderRadius: 10,
  borderColor: '#E0E0E0',
  borderWidth: 1,
  width: '30%',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
};

const timeOptionStyle = {
  padding: 15,
  borderRadius: 10,
  borderColor: '#E0E0E0',
  borderWidth: 1,
  marginBottom: 10,
  alignItems: 'center',
};

const dateTextStyle = {
  fontSize: 16,
  color: '#7d7d7d',
  marginLeft: 10,
};

const imageStyle = {
  width: 80,
  height: 80,
  marginRight: 10,
  borderRadius: 10,
};

const createButtonStyle = {
  backgroundColor: '#07bc0c',
  paddingVertical: 15,
  borderRadius: 10,
  marginTop: 20,
};

const locationPickerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: 10,
};

export default AdminCreateScreen;
