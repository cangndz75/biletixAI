import React, {useState} from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

const categories = [
  {name: 'Concert', icon: 'musical-notes-outline'},
  {name: 'Sports', icon: 'basketball-outline'},
  {name: 'Art', icon: 'color-palette-outline'},
  {name: 'Food', icon: 'restaurant-outline'},
  {name: 'Theatre', icon: 'film-outline'},
];

const capitalizeFirstLetter = text =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

const FilterModal = ({visible, onClose, onApply, onReset}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([20, 120]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');

  const toggleCategory = category => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category],
    );
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([20, 120]);
    setLocation('');
    setSelectedDate(null);
    onReset();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
        <View
          style={{
            backgroundColor: 'white',
            marginHorizontal: 20,
            borderRadius: 15,
            padding: 20,
          }}>
          <ScrollView>
            <Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>
              Filter
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{flexDirection: 'row', marginBottom: 20}}>
                {categories.map((category, index) => (
                  <Pressable
                    key={index}
                    onPress={() => toggleCategory(category.name)}
                    style={{
                      backgroundColor: selectedCategories.includes(
                        category.name,
                      )
                        ? '#7b61ff'
                        : '#f0f0f0',
                      borderRadius: 50,
                      padding: 15,
                      marginRight: 10,
                      alignItems: 'center',
                    }}>
                    <Ionicons
                      name={category.icon}
                      size={24}
                      color={
                        selectedCategories.includes(category.name)
                          ? 'white'
                          : '#7b61ff'
                      }
                    />
                    <Text
                      style={{
                        color: selectedCategories.includes(category.name)
                          ? 'white'
                          : '#000',
                        marginTop: 5,
                      }}>
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable onPress={() => setShowDatePicker(true)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderColor: '#ddd',
                  marginBottom: 20,
                }}>
                <Ionicons name="calendar-outline" size={24} color="#7b61ff" />
                <Text style={{marginLeft: 10}}>
                  {selectedDate ? selectedDate.toDateString() : 'Select Date'}
                </Text>
              </View>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TextInput
              placeholder="Enter Location"
              value={location}
              onChangeText={setLocation}
              style={{
                borderColor: '#ddd',
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                marginBottom: 20,
              }}
            />

            <Slider
              minimumValue={20}
              maximumValue={120}
              value={priceRange[0]}
              onValueChange={value => setPriceRange([value, priceRange[1]])}
              step={1}
              style={{width: '100%', height: 40}}
            />
            <Slider
              minimumValue={20}
              maximumValue={120}
              value={priceRange[1]}
              onValueChange={value => setPriceRange([priceRange[0], value])}
              step={1}
              style={{width: '100%', height: 40}}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}>
              <Text>${priceRange[0]}</Text>
              <Text>${priceRange[1]}</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 20,
              }}>
              <Pressable
                onPress={resetFilters}
                style={{
                  backgroundColor: '#ddd',
                  padding: 15,
                  borderRadius: 8,
                  width: '45%',
                  alignItems: 'center',
                }}>
                <Text>Reset</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onApply({
                    selectedCategories: selectedCategories.map(
                      capitalizeFirstLetter,
                    ),
                    priceRange,
                    location,
                    selectedDate,
                  });
                  onClose();
                }}
                style={{
                  backgroundColor: '#7b61ff',
                  padding: 15,
                  borderRadius: 8,
                  width: '45%',
                  alignItems: 'center',
                }}>
                <Text style={{color: 'white'}}>Apply</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
