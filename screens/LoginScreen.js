import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {login} = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifrenizi giriniz.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://biletixai.onrender.com/login',
        {email, password},
        {
          timeout: 10000, // 10 saniye timeout
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const {accessToken, refreshToken, role} = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error('Token bilgileri eksik');
      }

      // AuthContext'teki login fonksiyonunu çağır
      await login(accessToken, refreshToken);

      // Role göre yönlendirme
      if (role === 'organizer') {
        navigation.reset({
          index: 0,
          routes: [{name: 'AdminDashboard'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'MainApp'}],
        });
      }
    } catch (error) {
      let errorMessage = 'Giriş yapılırken bir hata oluştu.';

      if (error.response) {
        // Sunucudan gelen hata mesajı
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Sunucuya ulaşılamadı
        errorMessage =
          'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      }

      Alert.alert('Hata', errorMessage);
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Text style={styles.title}>Giriş Yap</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            placeholder="Şifre"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={handleLogin}
            style={styles.loginButton}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.registerButton}>
            <Text style={styles.registerButtonText}>
              Hesabınız yok mu? Kayıt olun
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default LoginScreen;
