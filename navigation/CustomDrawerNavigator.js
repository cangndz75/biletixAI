import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileDetailScreen from '../screens/ProfileDetail';
import HomeScreen from '../screens/HomeScreen';
import CustomDrawerContent from './CustomDrawerContent';
import EventScreen from '../screens/EventScreen';
import CommunityScreen from '../screens/CommunityScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import EventSetUpScreen from '../screens/EventSetUpScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'slide',
        overlayColor: 'transparent',
        drawerStyle: {
          width: 250,
        },
        headerShown: false,
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileDetailScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Event"
        component={EventScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CommunityScreen"
        component={CommunityScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default CustomDrawerNavigator;
