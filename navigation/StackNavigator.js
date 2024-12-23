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
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EventSetUpScreen from '../screens/EventSetUpScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityDetailScreen from '../screens/CommunityDetailScreen';
import AdminCreateScreen from '../screens/admin/AdminCreateScreen';
import AdminCommunityScreen from '../screens/admin/AdminCommunityScreen';
import AdminEventSetUpScreen from '../screens/admin/AdminEventSetUpScreen';
import AdminCreateVenueScreen from '../screens/admin/AdminCreateVenueScreen';
import AdminCreateCommunityScreen from '../screens/admin/AdminCreateCommunityScreen';
import ManageRequest from '../screens/admin/ManageRequest';
import SearchScreen from '../screens/SearchScreen';
import BecomeOrganizerScreen from '../screens/BecomeOrganizerScreen';
import InterestSelectionScreen from '../screens/InterestSelectionScreen';
import TagVenueScreen from '../screens/TagVenueScreen';
import AdminCommunityDetailScreen from '../screens/admin/AdminCommunityDetailScreen';
import AdminManageCommunityScreen from '../screens/admin/AdminManageCommunityScreen';
import EventAttendeesScreen from '../screens/EventAttendeesScreen';
import ProfileViewScreen from '../screens/ProfileViewScreen';
import ChatRoom from '../screens/ChatRoom';
import AddCustomQuestion from '../screens/admin/AddCustomQuestion';
import NotificationScreen from '../screens/NotificationScreen';
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
    <Stack.Screen
      name="CommunityScreen"
      component={CommunityScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="CommunityDetailScreen"
      component={CommunityDetailScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminCreate"
      component={AdminCreateScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminEvents"
      component={AdminEventScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminCreateCommunity"
      component={AdminCreateCommunityScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminCreateVenue"
      component={AdminCreateVenueScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminEventSetUp"
      component={AdminEventSetUpScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ManageRequest"
      component={ManageRequest}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="SearchScreen"
      component={SearchScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="BecomeOrganizerScreen"
      component={BecomeOrganizerScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="InterestSelectionScreen"
      component={InterestSelectionScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="TagVenue"
      component={TagVenueScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminCommunityScreen"
      component={AdminCommunityScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminCommunityDetailScreen"
      component={AdminCommunityDetailScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminManageCommunityScreen"
      component={AdminManageCommunityScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EventAttendees"
      component={EventAttendeesScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ProfileView"
      component={ProfileViewScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ChatRoom"
      component={ChatRoom}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AddCustomQuestion"
      component={AddCustomQuestion}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="NotificationScreen"
      component={NotificationScreen}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator>
    {/* <Stack.Screen
      name="Start"
      component={StartScreen}
      options={{headerShown: false}}
    /> */}
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
