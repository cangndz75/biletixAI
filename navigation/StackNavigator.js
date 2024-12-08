import React, {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {AuthContext} from '../AuthContext';
import EventScreen from '../screens/EventScreen';
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminEventScreen from '../screens/admin/AdminEventScreen';
import BookScreen from '../screens/BookScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileDetailScreen from '../screens/ProfileDetail';
import ChatsScreen from '../screens/ChatsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EventSetUpScreen from '../screens/EventSetUpScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const {role} = useContext(AuthContext);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={role === 'organizer' ? AdminDashboard : HomeScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={focused ? 'green' : 'gray'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Event"
        component={role === 'organizer' ? AdminEventScreen : EventScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <AntDesign
              name="calendar"
              size={24}
              color={focused ? 'green' : 'gray'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Book"
        component={BookScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={24}
              color={focused ? 'green' : 'gray'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileDetailScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={focused ? 'green' : 'gray'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen}
        options={{
          headerShown: false,
          tabBarActiveTintColor: 'green',
          tabBarIcon: ({focused}) => (
            <Ionicons
              name={focused ? 'chatbox' : 'chatbox-outline'}
              size={24}
              color={focused ? 'green' : 'gray'}
            />
          ),
        }}
      />
      {role !== 'organizer' && (
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            headerShown: false,
            tabBarActiveTintColor: 'green',
            tabBarIcon: ({focused}) => (
              <Ionicons
                name={focused ? 'heart' : 'heart-outline'}
                size={24}
                color={focused ? 'green' : 'gray'}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="BottomTabs"
      component={BottomTabs}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Start"
      component={StartScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{headerShown: false}}
    />
     <Stack.Screen
      name="Favorites"
      component={FavoritesScreen}
      options={{headerShown: false}}
    />
     <Stack.Screen
      name="EventSetUp"
      component={EventSetUpScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Start"
      component={StartScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const StackNavigator = () => {
  const {role} = useContext(AuthContext);

  return (
    <NavigationContainer>
      {role ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default StackNavigator;
