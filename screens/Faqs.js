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

const faqs = [
  {
    question: 'What is your return policy?',
    answer:
      'You can return any item within 30 days of purchase for a full refund. Items must be in their original condition with all tags attached. Refunds will be processed within 5-7 business days after we receive the returned items.',
  },
  {
    question: 'Do you offer international shipping?',
    answer:
      'Yes, we ship worldwide. Shipping costs and delivery times vary based on your location.',
  },
  {
    question: 'How can I track my order?',
    answer:
      'Once your order is shipped, you will receive a tracking number via email.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept credit/debit cards, PayPal, and Apple Pay.',
  },
  {
    question: 'How do I change or cancel my order?',
    answer:
      'Contact our customer service within 24 hours of placing your order to request changes or cancellations.',
  },
  {
    question: 'Do you offer gift wrapping?',
    answer:
      'Yes, we offer gift wrapping for a small additional fee during checkout.',
  },
  {
    question: 'What is your privacy policy?',
    answer:
      'We value your privacy and ensure your data is protected. Read our full privacy policy on our website.',
  },
  {
    question: 'Can I buy a gift card?',
    answer: 'Yes, you can purchase digital gift cards from our store.',
  },
  {
    question: 'How do I contact customer service?',
    answer:
      'You can reach us via email at support@ourstore.com or through our contact form on the website.',
  },
  {
    question: 'What is your warranty policy?',
    answer:
      'All our products come with a 1-year warranty covering manufacturing defects.',
  },
];

const AccordionItem = ({item}) => {
  const [expanded, setExpanded] = useState(false);
  const heightValue = useSharedValue(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    heightValue.value = expanded
      ? withTiming(0, {duration: 300, easing: Easing.ease})
      : withTiming(100, {duration: 300, easing: Easing.ease});
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: heightValue.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
        <Text style={styles.questionText}>{item.question}</Text>
        <Ionicons name={expanded ? 'close' : 'add'} size={20} color="#fff" />
      </TouchableOpacity>
      <Animated.View style={[styles.answerContainer, animatedStyle]}>
        <Text style={styles.answerText}>{item.answer}</Text>
      </Animated.View>
    </View>
  );
};

const Faqs = () => {
  const navigation = useNavigation(); // 📌 Navigasyonu ekledik

  return (
    <View style={styles.container}>
      {/* 🔙 Geri Butonu */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Text style={styles.subtitle}>
        Don't hesitate to reach out to us and we are happy to help you and
        assist you
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
    marginTop: 60, // 📌 Geri butonu için boşluk bırakıldı
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
