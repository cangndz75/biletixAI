import React, {useState, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Easing,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const {width, height} = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome',
    description:
      'Meet new people, expand your network and step into unforgettable experiences!',
    image: require('../assets/onboard1.jpg'),
  },
  {
    id: '2',
    title: 'Find New Friends',
    description:
      'Discover, participate and be part of the fun!',
    image: require('../assets/onboard2.jpg'),
  },
  {
    id: '3',
    title: 'Start Your Journey',
    description: 'Sign up now and discover events tailored to your interests!',
    image: require('../assets/onboard3.jpg'),
  },
];

const StartScreen = () => {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const onScroll = event => {
    scrollX.value = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX.value / width);
    setCurrentIndex(index);
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    buttonOpacity.value =
      currentIndex === slides.length - 1 ? withSpring(1) : withSpring(0);
    return {opacity: buttonOpacity.value};
  });

  return (
    <SafeAreaView style={styles.container}>
      {currentIndex < slides.length - 1 && (
        <Pressable
          style={styles.skipButton}
          onPress={() => {
            flatListRef.current?.scrollToIndex({index: 2, animated: true});
            setCurrentIndex(2);
          }}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={onScroll}
        renderItem={({item}) => (
          <View style={styles.slide}>
            <View style={styles.imageContainer}>
              <View style={styles.curvedBackground} />
              <Image source={item.image} style={styles.image} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => {
            const animatedDotStyle = useAnimatedStyle(() => {
              const scale = interpolate(
                scrollX.value / width,
                [index - 1, index, index + 1],
                [0.8, 1.5, 0.8],
              );
              const opacity = interpolate(
                scrollX.value / width,
                [index - 1, index, index + 1],
                [0.5, 1, 0.5],
              );
              return {
                transform: [{scale}],
                opacity,
              };
            });

            return (
              <Animated.View
                key={index}
                style={[styles.dot, animatedDotStyle]}
              />
            );
          })}
        </View>

        {currentIndex === slides.length - 1 && (
          <Animated.View style={[styles.buttonContainer, animatedButtonStyle]}>
            <Pressable
              style={[styles.toggleButton, styles.activeButton]}
              onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.toggleText, styles.activeText]}>
                Sign Up
              </Text>
            </Pressable>
            <Pressable
              style={styles.toggleButton}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.toggleText}>Sign In</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8EDEB',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  skipButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  imageContainer: {
    width: width,
    height: height * 0.4,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  curvedBackground: {
    position: 'absolute',
    width: width,
    height: height * 0.4,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: width / 2,
    borderBottomRightRadius: width / 2,
  },
  image: {
    width: width * 0.6,
    height: height * 0.35,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'flex-start',
    width: '80%',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    lineHeight: 22,
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
    width: 250,
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 4,
    opacity: 0,
  },
  toggleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 30,
  },
  activeButton: {
    backgroundColor: '#FF6B6B',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7A7A7A',
  },
  activeText: {
    color: '#FFF',
  },
});

export default StartScreen;
