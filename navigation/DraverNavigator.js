import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import StackNavigator from './StackNavigator';
import CommunityScreen from '../screens/CommunityScreen';
import CustomDrawerContent from './CustomDrawerContent';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useDrawerProgress} from '@react-navigation/drawer';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';

const Drawer = createDrawerNavigator();

function AnimatedScreen({children}) {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {scale: interpolate(progress.value, [0, 1], [1, 0.85])},
        {translateX: interpolate(progress.value, [0, 1], [0, 15])},
      ],
      borderRadius: interpolate(progress.value, [0, 1], [0, 15]),
      overflow: 'hidden',
    };
  });

  return (
    <Animated.View style={[{flex: 1}, animatedStyle]}>{children}</Animated.View>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerStyle: {backgroundColor: '#02754E', width: 250},
        drawerActiveTintColor: '#FFD700',
        drawerInactiveTintColor: '#fff',
        overlayColor: 'rgba(0, 0, 0, 0.4)',
        sceneContainerStyle: {backgroundColor: 'transparent'},
      }}>
      <Drawer.Screen
        name="Home"
        options={{
          drawerLabel: 'Home',
          drawerIcon: ({color, size}) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}>
        {props => (
          <AnimatedScreen>
            <StackNavigator {...props} />
          </AnimatedScreen>
        )}
      </Drawer.Screen>

      <Drawer.Screen
        name="Community"
        options={{
          drawerLabel: 'Communities',
          drawerIcon: ({color, size}) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}>
        {props => (
          <AnimatedScreen>
            <CommunityScreen {...props} />
          </AnimatedScreen>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
