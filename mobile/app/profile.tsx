import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { colors } from '../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { userService } from '../src/services/api';

// UserProfile tipi tanımla
interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  profile_image?: string;
  bio?: string;
  role?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Profil yüklenirken hata:', err);
      setError('Profil bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        "Çıkış Yap",
        "Çıkış yapmak istediğinize emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Çıkış Yap",
            onPress: async () => {
              // Sadece logout çağır - yönlendirme AuthContext'te yapılacak
              await logout();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Profil bilgileri bulunamadı'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ad Soyad</Text>
              <Text style={styles.value}>{profile.full_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>E-posta</Text>
              <Text style={styles.value}>{profile.email}</Text>
            </View>

            {profile.bio && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Hakkımda</Text>
                <Text style={styles.value}>{profile.bio}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Hesap Türü</Text>
              <Text style={styles.value}>
                {profile.role === 'admin' ? 'Yönetici' : 
                 profile.role === 'instructor' ? 'Eğitmen' : 'Öğrenci'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Durum</Text>
              <Text style={[styles.value, styles.activeStatus]}>Aktif</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileCard: {
    margin: 20,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  activeStatus: {
    color: colors.success,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.error,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
}); 