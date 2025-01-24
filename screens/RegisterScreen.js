import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {launchImageLibrary} from 'react-native-image-picker';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from 'react-native-alert-notification';
import Modal from 'react-native-modals';
import {ScrollView} from 'react-native-gesture-handler';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dhe3yon5d/image/upload';
const UPLOAD_PRESET = 'eventmate';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const selectImage = () => {
    launchImageLibrary({mediaType: 'photo'}, async response => {
      if (!response.didCancel && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        setProfileImage(imageUri);
      }
    });
  };

  const uploadImageToCloudinary = async imageUri => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `profile_${Date.now()}.jpg`,
    });
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await axios.post(CLOUDINARY_URL, formData, {
        headers: {'Content-Type': 'multipart/form-data'},
      });

      return response.data.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Error:', error);
      return null;
    }
  };

  const handlePrivacyAccept = () => {
    setPrivacyModalVisible(false);
    setIsChecked(true);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !isChecked) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Error',
        textBody:
          'Please fill in all fields and accept the Terms of Service and Privacy Policy.',
        button: 'Okay',
      });
      return;
    }

    if (password !== confirmPassword) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Password Mismatch',
        textBody: 'Passwords do not match. Please try again.',
        button: 'Okay',
      });
      return;
    }

    setIsLoading(true);
    let uploadedImageUrl = null;

    if (profileImage) {
      uploadedImageUrl = await uploadImageToCloudinary(profileImage);
    }

    const userData = {
      email,
      password,
      firstName: fullName.split(' ')[0] || '',
      lastName: fullName.split(' ')[1] || '',
      phoneNumber,
      image: uploadedImageUrl,
    };

    try {
      const response = await axios.post(
        'https://biletixai.onrender.com/register',
        userData,
      );

      if (response.data.message) {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'Success',
          textBody: 'Your account has been successfully created!',
          button: 'Okay',
          onPressButton: () => {
            navigation.replace('Login');
          },
        });
      }
    } catch (error) {
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: 'Registration Failed',
        textBody: error.response?.data?.message || 'Something went wrong!',
        button: 'Okay',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertNotificationRoot>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Sign up</Text>
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.imagePicker} onPress={selectImage}>
            {profileImage ? (
              <Image source={{uri: profileImage}} style={styles.profileImage} />
            ) : (
              <Ionicons name="camera-outline" size={40} color="#7d7d7d" />
            )}
          </TouchableOpacity>
          <TextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <TextInput
            placeholder="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setIsChecked(!isChecked)}
              style={styles.checkbox}>
              {isChecked && (
                <Ionicons name="checkmark" size={18} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
              <Text style={styles.termsText}>
                By creating an account you agree to our{' '}
                <Text style={styles.linkText}>
                  Terms of Service and Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
          <Pressable
            style={styles.submitButton}
            onPress={handleRegister}
            disabled={isLoading}>
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginBold}>Sign in !</Text>
            </Text>
          </Pressable>
        </View>
        <Modal
          visible={privacyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPrivacyModalVisible(false)}>
          <TouchableWithoutFeedback
            onPress={() => setPrivacyModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Privacy Policy</Text>
                <ScrollView>
                  <Text style={styles.modalText}>
                    Welcome to EventMate. We take your privacy seriously and are
                    committed to protecting your personal information.
                    {'\n\n'}- We collect necessary data to enhance user
                    experience.
                    {'\n'}- Your data is securely stored and never shared with
                    third parties.
                    {'\n'}- You have full control over your account and personal
                    data.
                    {'\n\n'}By signing up, you agree to our policies.
                  </Text>
                </ScrollView>
                <Pressable
                  style={styles.modalButton}
                  onPress={() => {
                    setPrivacyModalVisible(false);
                    setIsChecked(true);
                  }}>
                  <Text style={styles.modalButtonText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </AlertNotificationRoot>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    elevation: 3,
  },
  imagePicker: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  input: {
    backgroundColor: '#F8F9FD',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#007BFF',
  },
  termsText: {
    fontSize: 12,
  },
  linkText: {color: '#007bff'},
  submitButton: {
    backgroundColor: '#00BFA5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 15,
    alignSelf: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#555',
  },
  loginBold: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: 'center', 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
