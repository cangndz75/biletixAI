import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const AdminCommunityScreen = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        'https://biletixai.onrender.com/communities',
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      setCommunities(response.data);
    } catch (error) {
      console.error(
        'Toplulukları çekerken hata:',
        error.message,
        error.response ? error.response.data : 'Sunucuya erişim yok',
      );
      Alert.alert('Hata', 'Topluluklar bulunamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleManageRequests = communityId => {
    navigation.navigate('AdminManageCommunityScreen', {communityId});
  };

  const handleViewDetails = communityId => {
    navigation.navigate('AdminCommunityDetailScreen', {communityId});
  };

  const toggleTheme = async () => {
    setDarkMode(!darkMode);
    await AsyncStorage.setItem('theme', darkMode ? 'light' : 'dark');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A5ACD" />
        <Text style={{marginTop: 10}}>Veriler Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Kısım: Geri Butonu, Başlık ve Tema Değiştirici */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={28}
            color={darkMode ? '#FFF' : '#000'}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Topluluklar</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={darkMode ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={darkMode ? '#FFD700' : '#555'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {communities.length === 0 ? (
          <Text style={styles.noCommunityText}>Henüz topluluk bulunmuyor.</Text>
        ) : (
          communities.map(community => (
            <View key={community._id} style={styles.communityCard}>
              {/* Profil Resmi ve Bilgiler */}
              <Image
                source={{
                  uri:
                    community.profileImage || 'https://via.placeholder.com/100',
                }}
                style={styles.communityImage}
              />
              <View style={styles.communityInfo}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityMembers}>
                  {community.members.length} Üye
                </Text>
                <Text style={styles.communityDescription} numberOfLines={2}>
                  {community.description}
                </Text>
              </View>

              {/* Butonlar */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleManageRequests(community._id)}
                  style={styles.manageButton}>
                  <Ionicons name="people-outline" size={20} color="white" />
                  <Text style={styles.buttonText}>
                    Yönet (
                    {
                      community.joinRequests.filter(
                        req => req.status === 'pending',
                      ).length
                    }
                    )
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleViewDetails(community._id)}
                  style={styles.detailsButton}>
                  <AntDesign name="eyeo" size={20} color="white" />
                  <Text style={styles.buttonText}>Detayları Gör</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCommunityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#6A5ACD',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  communityCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  communityImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  communityMembers: {
    fontSize: 14,
    color: '#6A5ACD',
    fontWeight: 'bold',
    marginVertical: 2,
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginBottom: 5,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noCommunityText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
