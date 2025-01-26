import React, {useContext, useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
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
import StaffDashboard from '../screens/StaffDashboard';
import SuperAdminDashboard from '../screens/SuperAdminDashboard';
import ManageOrganizersScreen from '../screens/super-admin/ManageOrganizersScreen';
import AddStaffScreen from '../screens/super-admin/AddStaffScreen';
import ManageStaffScreen from '../screens/super-admin/ManageStaffScreen';
import StaffDetailsScreen from '../screens/super-admin/StaffDetailsScreen';
import OrganizerSubscribe from '../screens/OrganizerSubscribe';
import UserSubscribe from '../screens/UserSubscribe';
import CreateCustomQuestion from '../screens/admin/CreateCustomQuestion';
import JoinCommunityScreen from '../screens/JoinCommunityScreen';
import ReviewScreen from '../screens/ReviewScreen';
import PostScreen from '../screens/PostScreen';
import VenueInfoScreen from '../screens/VenueInfoScreen';
import CreatePost from '../screens/CreatePost';
import LikeScreen from '../screens/LikeScreen';
import CommentScreen from '../screens/CommentScreen';
import MyBookings from '../screens/MyBookings';
import Faqs from '../screens/Faqs';
import ETicketScreen from '../screens/ETicketScreen';
import StaffQrScreen from '../screens/StaffQrScreen';
import RequestForOrganizer from '../screens/super-admin/RequestForOrganizer';
import StartScreen from '../screens/StartScreen';
import LocationScreen from '../screens/LocationScreen';
import EventsForLocation from '../screens/EventsForLocation';
import AdminAdScreen from '../screens/admin/AdminAdScreen';
import OrganizerStats from '../screens/admin/OrganizerStats';
import WebViewScreen from '../screens/WebViewScreen';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

const BottomTabs = () => {
  const {role} = useContext(AuthContext);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={
          role === 'organizer'
            ? AdminDashboard
            : role === 'staff'
            ? StaffDashboard
            : role === 'super_admin'
            ? SuperAdminDashboard
            : HomeScreen
        }
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
    <Stack.Screen
      name="ManageOrganizersScreen"
      component={ManageOrganizersScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AddStaffScreen"
      component={AddStaffScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ManageStaffScreen"
      component={ManageStaffScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="StaffDetailsScreen"
      component={StaffDetailsScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="OrganizerSubscribe"
      component={OrganizerSubscribe}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="UserSubscribe"
      component={UserSubscribe}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="CreateCustomQuestion"
      component={CreateCustomQuestion}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminDashboard"
      component={AdminDashboard}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="JoinCommunityScreen"
      component={JoinCommunityScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ReviewScreen"
      component={ReviewScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostScreen"
      component={PostScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="VenueInfo"
      component={VenueInfoScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="CreatePost"
      component={CreatePost}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="LikeScreen"
      component={LikeScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="CommentScreen"
      component={CommentScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="MyBookings"
      component={MyBookings}
      options={{headerShown: false}}
    />
    <Stack.Screen name="Faqs" component={Faqs} options={{headerShown: false}} />
    <Stack.Screen
      name="ETicketScreen"
      component={ETicketScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="StaffQrScreen"
      component={StaffQrScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="WebViewScreen"
      component={WebViewScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="RequestForOrganizer"
      component={RequestForOrganizer}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="StartScreen"
      component={StartScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="LocationScreen"
      component={LocationScreen}
      initialParams={{onCitySelect: () => {}, onDistrictSelect: () => {}}}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EventsForLocation"
      component={EventsForLocation}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EventScreen"
      component={EventScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AdminAdScreen"
      component={AdminAdScreen}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="OrganizerStats"
      component={OrganizerStats}
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

  useEffect(() => {
    const handleRefresh = () => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('StartScreen');
      }
    };

    if (module.hot) {
      module.hot.accept(() => {
        handleRefresh();
      });
    }
  }, []);
  return role ? <MainStack /> : <AuthStack />;
};

export default StackNavigator;
