import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';

const WebViewScreen = ({route, navigation}) => {
  const {url} = route.params;

  return (
    <View style={{flex: 1}}>
      <WebView
        source={{uri: url}}
        startInLoadingState
        renderLoading={() => (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
          />
        )}
        onNavigationStateChange={navState => {
          if (navState.url.includes('/success')) {
            navigation.replace('Profile'); 
          }
          if (navState.url.includes('/cancel')) {
            navigation.goBack(); 
          }
        }}
      />
    </View>
  );
};

export default WebViewScreen;
