import React from 'react';
import {
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './AuthContext';
import {ModalPortal} from 'react-native-modals';
import {SocketProvider} from './SocketContext';
import {EventProvider} from './EventContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import CustomDrawerNavigator from './navigation/CustomDrawerNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <AuthProvider>
          <SocketProvider>
            <EventProvider>
              <NavigationContainer>
                <CustomDrawerNavigator />
              </NavigationContainer>
              <ModalPortal />
            </EventProvider>
          </SocketProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
