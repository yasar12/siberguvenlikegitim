import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { Card } from '../components/Card';
import { colors } from '../constants/colors';
import { userService, authService } from '../services/api';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  bio?: string;
  role: string;
  profile_image?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

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
      await authService.logout();
      router.replace('/login');
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileCard: {
    margin: 16,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  },
  activeStatus: {
    color: colors.success,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
}); 