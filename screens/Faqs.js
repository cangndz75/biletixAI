import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

// 📌 EventMate FAQ List
const faqs = [
  {
    question: 'How does EventMate work?',
    answer:
      'EventMate helps users discover events, buy tickets, and join events with friends. Organizers can also create and manage their events.',
  },
  {
    question: 'How can I create an event?',
    answer:
      'Tap the "Create Event" button, fill in the required details, and publish your event. With Organizer Plus, you get access to more features.',
  },
  {
    question: 'What should I do after buying a ticket?',
    answer:
      'Your purchased tickets will be listed under the "My Bookings" section. Use your QR code for event check-in.',
  },
  {
    question: 'How do I join an event?',
    answer:
      'You can join an event by clicking the "Join Event" button on the event page or by purchasing a ticket.',
  },
  {
    question: 'How do I join a community?',
    answer:
      'Go to the Community section, choose a community, and tap "Join Community." Some communities may require approval.',
  },
  {
    question: 'Can I cancel my ticket?',
    answer:
      'Ticket cancellations depend on the event organizer’s policies. You can request a cancellation in the "My Bookings" section.',
  },
  {
    question: 'Is EventMate free?',
    answer:
      'EventMate is free to use, but premium features (Organizer Plus, User Plus) offer additional benefits.',
  },
  {
    question: 'Can I add friends?',
    answer:
      'Yes! You can visit user profiles to send friend requests and attend events together.',
  },
  {
    question: 'What are the benefits for event organizers?',
    answer:
      'Organizer Plus subscribers can add unlimited events, promote their events on the homepage, and boost ticket sales.',
  },
  {
    question: 'How can I contact customer support?',
    answer:
      'You can reach us through the "Help & Support" section or by emailing support@eventmate.com.',
  },
];

const AccordionItem = ({item}) => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    heightValue.value = expanded
      ? withTiming(0, {duration: 300, easing: Easing.ease})
      : withTiming(120, {duration: 300, easing: Easing.ease});
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: heightValue.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
        <Text style={styles.questionText}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
      <Animated.View style={[styles.answerContainer, animatedStyle]}>
        <Text style={styles.answerText}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
};

const Faqs = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Text style={styles.subtitle}>
        Find answers to your questions about EventMate. If you need further
        assistance, feel free to contact us.
      </Text>

      <FlatList
        data={faqs}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <AccordionItem item={item} />}
      />
    </View>
  );
};

export default Faqs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    marginTop: 60,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  accordionContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    marginBottom: 10,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  answerContainer: {
    overflow: 'hidden',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  answerText: {
    fontSize: 14,
    color: '#ddd',
  },
});
